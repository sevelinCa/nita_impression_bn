import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateReturns1737637890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'returns' table
    await queryRunner.createTable(
      new Table({
        name: 'returns',
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
            name: 'eventId',
            type: 'uuid',
          },
          {
            name: 'eventItemId',
            type: 'uuid',
          },
          {
            name: 'materialId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'rentalMaterialId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'returnedQuantity',
            type: 'int',
          },
          {
            name: 'remainingQuantity',
            type: 'int',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['complete', 'incomplete'],
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

    // Ensure 'events', 'users', and 'event_items' tables exist before adding foreign keys
    const tableExists = async (tableName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}');`,
      );
      return result[0].exists;
    };

    const eventsTableExists = await tableExists('events');
    const eventItemsTableExists = await tableExists('event_items');
    const materialsTableExists = await tableExists('materials');
    const rentalMaterialsTableExists = await tableExists('rental_materials');

    if (eventsTableExists) {
      await queryRunner.createForeignKey(
        'returns',
        new TableForeignKey({
          columnNames: ['eventId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'events',
          onDelete: 'CASCADE',
        }),
      );
    }

    if (eventItemsTableExists) {
      await queryRunner.createForeignKey(
        'returns',
        new TableForeignKey({
          columnNames: ['eventItemId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'event_items',
          onDelete: 'CASCADE',
        }),
      );
    }

    if (materialsTableExists) {
      await queryRunner.createForeignKey(
        'returns',
        new TableForeignKey({
          columnNames: ['materialId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'materials',
          onDelete: 'SET NULL',
        }),
      );
    }

    if (rentalMaterialsTableExists) {
      await queryRunner.createForeignKey(
        'returns',
        new TableForeignKey({
          columnNames: ['rentalMaterialId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'rental_materials',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and 'returns' table
    const table = await queryRunner.getTable('returns');
    if (table) {
      const eventForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('eventId') !== -1,
      );
      const eventItemForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('eventItemId') !== -1,
      );
      const materialForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('materialId') !== -1,
      );
      const rentalMaterialForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('rentalMaterialId') !== -1,
      );

      if (eventForeignKey) {
        await queryRunner.dropForeignKey('returns', eventForeignKey);
      }
      if (eventItemForeignKey) {
        await queryRunner.dropForeignKey('returns', eventItemForeignKey);
      }
      if (materialForeignKey) {
        await queryRunner.dropForeignKey('returns', materialForeignKey);
      }
      if (rentalMaterialForeignKey) {
        await queryRunner.dropForeignKey('returns', rentalMaterialForeignKey);
      }
    }

    await queryRunner.dropTable('returns');
  }
}
