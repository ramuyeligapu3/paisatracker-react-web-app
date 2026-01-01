import csv
from io import StringIO
import time
import logging
from datetime import datetime
from bson import ObjectId
from backend.app.models.models import TransactionModel

logger = logging.getLogger(__name__)
CHUNK_SIZE = 1024 * 1024  # 1MB

async def csv_generator(user_id, start_date=None, end_date=None):
    buffer = StringIO()
    # Use \r\n for Windows Excel compatibility
    writer = csv.writer(buffer, lineterminator="\r\n")

    # Header without user_id
    writer.writerow(["date", "description", "amount", "account", "category"])
    # Add BOM for Excel to recognize UTF-8
    yield ("\ufeff" + buffer.getvalue()).encode("utf-8")
    buffer.seek(0)
    buffer.truncate(0)

    row_count = 0
    start_time = time.time()

    try:
        # Query transactions for this user
        query = TransactionModel.find(TransactionModel.user_id.id == ObjectId(user_id))
        if start_date:
            query = query.find(TransactionModel.date >= start_date)
        if end_date:
            query = query.find(TransactionModel.date <= end_date)

        async for transaction in query:
            row = [
                transaction.date.isoformat() if transaction.date else "",
                transaction.description or "",
                transaction.amount,
                transaction.account or "",
                transaction.category or ""
            ]
            writer.writerow(row)
            row_count += 1

            # Stream in chunks
            if buffer.tell() >= CHUNK_SIZE:
                yield buffer.getvalue().encode("utf-8")
                buffer.seek(0)
                buffer.truncate(0)

        # Yield remaining data
        if buffer.tell() > 0:
            yield buffer.getvalue().encode("utf-8")

        logger.info(f"CSV export completed: {row_count} rows in {time.time() - start_time:.2f}s")

    except Exception:
        logger.exception("Error during CSV export")
        return
