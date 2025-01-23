import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMaterials1737630123456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'materials' table
    await queryRunner.createTable(
      new Table({
        name: 'materials',
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
            name: 'categoryId',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10, // Adjust precision/scale if needed
            scale: 2,
            isNullable: true,
          },
          {
            name: 'rentalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
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

    // Add foreign key for 'categoryId' referencing 'categories.id'
    await queryRunner.createForeignKey(
      'materials',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and 'materials' table
    const table = await queryRunner.getTable('materials');
    if (table) {
      const categoryForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('categoryId') !== -1,
      );
      if (categoryForeignKey) {
        await queryRunner.dropForeignKey('materials', categoryForeignKey);
      }
    }

    await queryRunner.dropTable('materials');
  }
}
