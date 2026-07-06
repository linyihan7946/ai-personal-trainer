"""add subject to exams table

Revision ID: 3734621c2577
Revises: 
Create Date: 2026-07-06 15:28:58.813891

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3734621c2577'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("exams")}

    if "subject" not in columns:
        op.add_column(
            'exams',
            sa.Column('subject', sa.String(length=20), nullable=False, server_default='通用'),
        )

    indexes = {index["name"] for index in inspector.get_indexes("exams")}
    if op.f('ix_exams_subject') not in indexes:
        op.create_index(op.f('ix_exams_subject'), 'exams', ['subject'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    indexes = {index["name"] for index in inspector.get_indexes("exams")}
    columns = {column["name"] for column in inspector.get_columns("exams")}

    if op.f('ix_exams_subject') in indexes:
        op.drop_index(op.f('ix_exams_subject'), table_name='exams')
    if "subject" in columns:
        op.drop_column('exams', 'subject')
