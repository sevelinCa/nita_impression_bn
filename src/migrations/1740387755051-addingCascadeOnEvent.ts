import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingCascadeOnEvent1740387755051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_items" 
            DROP CONSTRAINT IF EXISTS "FK_event_items_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_items"
            ADD CONSTRAINT "FK_event_items_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_items" 
            DROP CONSTRAINT IF EXISTS "FK_event_items_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_items"
            ADD CONSTRAINT "FK_event_items_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
        `);
  }
}
