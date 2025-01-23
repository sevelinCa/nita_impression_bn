import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEvent1737620237101 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'ongoing', 'done', 'closed', 'cancelled'],
            default: "'planning'",
          },
          {
            name: 'cost',
            type: 'numeric',
          },
          {
            name: 'employeeFee',
            type: 'numeric',
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('events');
  }
}
