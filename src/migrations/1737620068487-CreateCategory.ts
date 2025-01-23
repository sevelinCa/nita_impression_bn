import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCategory1737620068487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the 'categories' table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
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
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Check if 'materials' table exists before adding foreign key
    const materialsTableExists = await queryRunner.hasTable('materials');
    if (materialsTableExists) {
      await queryRunner.createForeignKey(
        'materials',
        new TableForeignKey({
          columnNames: ['categoryId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',
        }),
      );
    }

    // Check if 'rental_materials' table exists before adding foreign key
    const rentalMaterialsTableExists =
      await queryRunner.hasTable('rental_materials');
    if (rentalMaterialsTableExists) {
      await queryRunner.createForeignKey(
        'rental_materials',
        new TableForeignKey({
          columnNames: ['categoryId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys if tables exist
    const materialsTableExists = await queryRunner.hasTable('materials');
    if (materialsTableExists) {
      await queryRunner.dropForeignKey('materials', 'categoryId');
    }

    const rentalMaterialsTableExists =
      await queryRunner.hasTable('rental_materials');
    if (rentalMaterialsTableExists) {
      await queryRunner.dropForeignKey('rental_materials', 'categoryId');
    }

    // Drop 'categories' table
    await queryRunner.dropTable('categories');
  }
}
