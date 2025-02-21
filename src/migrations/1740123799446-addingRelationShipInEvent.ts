import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddingRelationShipInEvent1740123799446
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'employeeFee',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: '0',
      }),
    );

    await queryRunner.createForeignKey(
      'event_users',
      new TableForeignKey({
        columnNames: ['eventId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'events',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('event_users', 'FK_event_users_eventId');
    await queryRunner.dropColumn('events', 'employeeFee');
  }
}
