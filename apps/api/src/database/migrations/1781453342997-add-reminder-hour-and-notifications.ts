import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReminderHourAndNotifications1781453342997 implements MigrationInterface {
  name = 'AddReminderHourAndNotifications1781453342997';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_settings" ADD "reminder_hour" smallint NOT NULL DEFAULT '19'`);

    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" character varying(40) NOT NULL, "title" character varying(160) NOT NULL, "body" text NOT NULL, "data" jsonb, "read_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid, CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_created_at" ON "notifications" ("user_id", "created_at")`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP COLUMN "reminder_hour"`);
  }
}
