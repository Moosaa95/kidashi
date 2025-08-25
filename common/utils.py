from django.db import connection
from datetime import datetime, timedelta
import calendar
import logging

logger = logging.getLogger(__name__)


class PartitionManager:
    """Utility class for managing PostgreSQL partitions"""

    @staticmethod
    def create_monthly_partition(table_name, year, month):
        """Create a monthly partition for the given table"""
        start_date = datetime(year, month, 1).date()
        last_day = calendar.monthrange(year, month)[1]
        end_date = datetime(year, month, last_day).date() + timedelta(days=1)

        partition_name = f"{table_name}_{year}_{month:02d}"

        with connection.cursor() as cursor:
            # Check if partition exists
            sql = f"SELECT EXISTS (SELECT 1 FROM information_schema.tablesWHERE table_name = {partition_name})"
            cursor.execute(sql)

            if cursor.fetchone()[0]:
                logger.info(f"Partition {partition_name} already exists")
                return False

            # Create partition
            create_sql = f"""
                CREATE TABLE {partition_name} PARTITION OF {table_name}
                FOR VALUES FROM ('{start_date}') TO ('{end_date}')
            """

            cursor.execute(create_sql)
            logger.info(f"Created partition: {partition_name}")
            return True

    @staticmethod
    def drop_old_partitions(table_name, months_to_keep=12):
        """Drop partitions older than specified months"""
        cutoff_date = datetime.now().date() - timedelta(days=30 * months_to_keep)

        with connection.cursor() as cursor:
            # Find old partitions
            cursor.execute(
                """
                           SELECT schemaname, tablename
                           FROM pg_tables
                           WHERE tablename LIKE %s
                             AND tablename < %s
                           """,
                [f"{table_name}_%", f"{table_name}_{cutoff_date.strftime('%Y_%m')}"],
            )

            old_partitions = cursor.fetchall()

            for schema, partition_name in old_partitions:
                try:
                    cursor.execute(f"DROP TABLE {schema}.{partition_name}")
                    logger.info(f"Dropped old partition: {partition_name}")
                except Exception as e:
                    logger.error(f"Failed to drop partition {partition_name}: {e}")

    @staticmethod
    def get_partition_info(table_name):
        """Get information about existing partitions"""

        with connection.cursor() as cursor:
            cursor.execute(
                """
                           SELECT
                               pt.schemaname,
                               pt.tablename,
                               pg_size_pretty(pg_total_relation_size(pt.schemaname||'.'||pt.tablename)) as size,
                    pg_stat_user_tables.n_tup_ins as inserts,
                    pg_stat_user_tables.n_tup_upd as updates,
                    pg_stat_user_tables.n_tup_del as deletes
                           FROM pg_tables pt
                               LEFT JOIN pg_stat_user_tables ON pt.tablename = pg_stat_user_tables.relname
                           WHERE pt.tablename LIKE %s
                           ORDER BY pt.tablename
                           """,
                [f"{table_name}_%"],
            )

            columns = ["schema", "table_name", "size", "inserts", "updates", "deletes"]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
