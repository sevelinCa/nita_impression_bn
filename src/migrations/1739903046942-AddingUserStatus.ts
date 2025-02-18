import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddingUserStatus1739903046942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'status');
  }
}
