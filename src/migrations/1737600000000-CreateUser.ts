import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUser1737618172469 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'users' table
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
            type: 'int',
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

    // Create 'events_users' table for the many-to-many relationship
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

    // Add foreign key for 'events_users.eventId' referencing 'events.id'
    await queryRunner.createForeignKey(
      'events_users',
      new TableForeignKey({
        columnNames: ['eventId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'events',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for 'events_users.userId' referencing 'users.id'
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
    // Drop foreign keys first
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

    // Drop 'events_users' table
    await queryRunner.dropTable('events_users');

    // Drop 'users' table
    await queryRunner.dropTable('users');
  }
}
