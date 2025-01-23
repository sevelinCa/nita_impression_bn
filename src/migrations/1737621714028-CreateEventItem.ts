import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEventItems1737628901123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'eventItems',
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
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'names',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['returnable', 'non-returnable'],
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

    const eventsTableExists = await queryRunner.hasTable('events');
    if (eventsTableExists) {
      await queryRunner.createForeignKey(
        'eventItems',
        new TableForeignKey({
          columnNames: ['eventId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'events',
          onDelete: 'CASCADE',
        }),
      );
    }

    const materialsTableExists = await queryRunner.hasTable('materials');
    if (materialsTableExists) {
      await queryRunner.createForeignKey(
        'eventItems',
        new TableForeignKey({
          columnNames: ['materialId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'materials',
          onDelete: 'SET NULL',
        }),
      );
    }

    const rentalMaterialsTableExists =
      await queryRunner.hasTable('rentalMaterials');
    if (rentalMaterialsTableExists) {
      await queryRunner.createForeignKey(
        'eventItems',
        new TableForeignKey({
          columnNames: ['rentalMaterialId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'rentalMaterials',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('eventItems');
    if (table) {
      const eventForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('eventId') !== -1,
      );
      const materialForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('materialId') !== -1,
      );
      const rentalMaterialForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('rentalMaterialId') !== -1,
      );

      if (eventForeignKey) {
        await queryRunner.dropForeignKey('eventItems', eventForeignKey);
      }
      if (materialForeignKey) {
        await queryRunner.dropForeignKey('eventItems', materialForeignKey);
      }
      if (rentalMaterialForeignKey) {
        await queryRunner.dropForeignKey(
          'eventItems',
          rentalMaterialForeignKey,
        );
      }
    }

    await queryRunner.dropTable('eventItems');
  }
}
