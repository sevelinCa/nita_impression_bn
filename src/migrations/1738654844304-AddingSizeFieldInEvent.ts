import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddingSizeFieldInEvent1738654844304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'events',
      new TableColumn({
        name: 'size',
        type: 'enum',
        enum: ['small', 'big'],
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('events', 'size');
  }
}
