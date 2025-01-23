import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRentalMaterials1737634567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rental_materials',
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
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'rentingCost',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'vendorName',
            type: 'varchar',
          },
          {
            name: 'vendorContact',
            type: 'varchar',
          },
          {
            name: 'rentalDate',
            type: 'date',
          },
          {
            name: 'returnDate',
            type: 'date',
          },
          {
            name: 'categoryId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
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

    await queryRunner.createForeignKey(
      'rental_materials',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rental_materials');
    if (table) {
      const categoryForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('categoryId') !== -1,
      );
      if (categoryForeignKey) {
        await queryRunner.dropForeignKey(
          'rental_materials',
          categoryForeignKey,
        );
      }
    }

    await queryRunner.dropTable('rental_materials');
  }
}
