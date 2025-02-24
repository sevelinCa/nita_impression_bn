import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingCascadeOnEventUsers1740387940382
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_user"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            ALTER COLUMN "eventId" SET NOT NULL,
            ALTER COLUMN "userId" SET NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_user"
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_event"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            DROP CONSTRAINT IF EXISTS "FK_event_users_user"
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users" 
            ALTER COLUMN "eventId" DROP NOT NULL,
            ALTER COLUMN "userId" DROP NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_event"
            FOREIGN KEY ("eventId") 
            REFERENCES "events"("id")
        `);

    await queryRunner.query(`
            ALTER TABLE "event_users"
            ADD CONSTRAINT "FK_event_users_user"
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id")
        `);
  }
}
