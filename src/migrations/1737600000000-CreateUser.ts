import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUser1737618172469 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'fullName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: `'worker'`,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            length: '15',
            isNullable: true,
          },
          {
            name: 'profile',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'age',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'resetPasswordToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resetPasswordExpires',
            type: 'timestamp',
            isNullable: true,
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

    await queryRunner.createTable(
      new Table({
        name: 'events_users',
        columns: [
          {
            name: 'eventId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    const eventsTableExists = await queryRunner.hasTable('events');
    if (eventsTableExists) {
      await queryRunner.createForeignKey(
        'events_users',
        new TableForeignKey({
          columnNames: ['eventId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'events',
          onDelete: 'CASCADE',
        }),
      );
    }

    await queryRunner.createForeignKey(
      'events_users',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('events_users');
    if (table) {
      const eventForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('eventId') !== -1,
      );
      const userForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );

      if (eventForeignKey) {
        await queryRunner.dropForeignKey('events_users', eventForeignKey);
      }
      if (userForeignKey) {
        await queryRunner.dropForeignKey('events_users', userForeignKey);
      }
    }

    await queryRunner.dropTable('events_users');

    await queryRunner.dropTable('users');
  }
}
