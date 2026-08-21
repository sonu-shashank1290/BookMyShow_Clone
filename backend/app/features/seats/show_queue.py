"""Per-show FIFO queue — the classroom version of Kafka.

A real BookMyShow-scale system would publish lock/book commands to Kafka
partitioned by show_id. One partition = one hall, so five people grabbing
overlapping seats for the same show are processed one after another, never
in parallel.

We do not run Kafka in this clone. Same idea, in-process:

    show_id  →  its own asyncio.Queue  →  one worker coroutine

Jobs for different shows still run concurrently. Jobs for the same show wait
in line.
"""

from __future__ import annotations

import asyncio
from typing import Awaitable, Callable, Dict, TypeVar

T = TypeVar("T")

Job = Callable[[], Awaitable[T]]


class _ShowWorker:
    def __init__(self) -> None:
        self.queue: asyncio.Queue = asyncio.Queue()
        self.task: asyncio.Task | None = None

    def ensure_running(self) -> None:
        if self.task is None or self.task.done():
            self.task = asyncio.create_task(self._run())

    async def _run(self) -> None:
        while True:
            job, future = await self.queue.get()
            try:
                future.set_result(await job())
            except Exception as exc:
                future.set_exception(exc)
            finally:
                self.queue.task_done()


_workers: Dict[str, _ShowWorker] = {}
_guard = asyncio.Lock()


async def submit(show_id: str, job: Job[T]) -> T:
    """Enqueue work for this show and wait until this request's turn is done."""
    loop = asyncio.get_running_loop()
    future: asyncio.Future[T] = loop.create_future()

    async with _guard:
        worker = _workers.get(show_id)
        if worker is None:
            worker = _ShowWorker()
            _workers[show_id] = worker
        worker.ensure_running()

    await worker.queue.put((job, future))
    return await future
