"""Merge heads 1973e633eea5 and c360f7e67f44

Revision ID: 0548c60f8f61
Revises: 1973e633eea5, c360f7e67f44
Create Date: 2024-05-28 00:18:46.422365

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0548c60f8f61'
down_revision: Union[str, None] = ('1973e633eea5', 'c360f7e67f44')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
