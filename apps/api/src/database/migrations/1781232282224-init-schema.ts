import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1781232282224 implements MigrationInterface {
  name = 'InitSchema1781232282224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "daily_goal_sentences" smallint NOT NULL DEFAULT '10', "push_token" character varying(255), "notification_enabled" boolean NOT NULL DEFAULT true, "timezone" character varying(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', "user_id" uuid, CONSTRAINT "REL_4ed056b9344e6f7d8d46ec4b30" UNIQUE ("user_id"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying(255) NOT NULL, "password_hash" text NOT NULL, "display_name" character varying(120) NOT NULL, "avatar_url" text, "xp_total" integer NOT NULL DEFAULT '0', "level_rank" character varying(40) NOT NULL DEFAULT 'Beginner', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens"  ("token_hash") `);
    await queryRunner.query(`CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens"  ("user_id") `);
    await queryRunner.query(
      `CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "slug" character varying(160) NOT NULL, "title" character varying(240) NOT NULL, "description" text, "level" character varying(20) NOT NULL DEFAULT 'beginner', "topic" character varying(120), "source" character varying(120), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ca2edfa23c965f9c435572a7de" ON "lessons"  ("slug") `);
    await queryRunner.query(
      `CREATE TABLE "sentences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order" integer NOT NULL DEFAULT '0', "text" text NOT NULL, "ipa" character varying(300), "translation" text, "audio_url" text, "lesson_id" uuid, CONSTRAINT "PK_9b3aec16318cf425aaddad6dd5f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_9f337e64c6a597f336053f8d60" ON "sentences"  ("lesson_id", "order") `);
    await queryRunner.query(
      `CREATE TABLE "xp_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" smallint NOT NULL, "source_type" character varying(40) NOT NULL, "source_id" uuid, "user_id" uuid, CONSTRAINT "PK_ff53781040f34f17bddeae20f4a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_4b4888f4cfa156c25fa21e2bc8" ON "xp_events"  ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_cbaf6ad50a6249dad9e344e651" ON "xp_events"  ("user_id", "created_at") `);
    await queryRunner.query(
      `CREATE TABLE "attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "mode" character varying(20) NOT NULL, "self_assessment" character varying(10) NOT NULL, "srs_interval" integer NOT NULL DEFAULT '1', "srs_ease" double precision NOT NULL DEFAULT '2.5', "srs_due_at" date NOT NULL, "recording_url" text, "ai_score" jsonb, "attempted_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, "sentence_id" uuid, CONSTRAINT "PK_295ca261e361fd2fd217754dcac" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_1f23e642cf6e009c61cc2c214e" ON "attempts"  ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_8712591635416b27cdd8518346" ON "attempts"  ("sentence_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_36e3ec5afda139c95b81d96646" ON "attempts"  ("srs_due_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_ceeb084f0baff9480df9ef114b" ON "attempts"  ("user_id", "srs_due_at") `);
    await queryRunner.query(
      `CREATE TABLE "user_lesson_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "status" character varying(20) NOT NULL DEFAULT 'in_progress', "completion_pct" smallint NOT NULL DEFAULT '0', "last_practiced_at" TIMESTAMP WITH TIME ZONE, "xp_earned" integer NOT NULL DEFAULT '0', "user_id" uuid, "lesson_id" uuid, CONSTRAINT "PK_2d52c2d4b5f26e61b3169d3d01a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_5ce08039490cd0e619ae956051" ON "user_lesson_progress"  ("user_id") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ca7535b366966615043ad206d5" ON "user_lesson_progress"  ("user_id", "lesson_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "user_streaks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "current_streak" integer NOT NULL DEFAULT '0', "longest_streak" integer NOT NULL DEFAULT '0', "last_active_day" integer, "grace_used_today" boolean NOT NULL DEFAULT false, "user_id" uuid, CONSTRAINT "REL_91fc9bfd912d8ce3ae4be2ea19" UNIQUE ("user_id"), CONSTRAINT "PK_a6d61a62372a94e55ca04ab8373" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "vocabularies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "word" character varying(120) NOT NULL, "meaning_vn" text NOT NULL, "meaning_en" text, "ipa" character varying(200), "synonyms" jsonb NOT NULL DEFAULT '[]', "example_sentences" jsonb NOT NULL DEFAULT '[]', "topic" character varying(120), "level" character varying(20) NOT NULL DEFAULT 'beginner', "audio_url" text, "source_lesson_id" uuid, CONSTRAINT "PK_1f0c8d5539ccaf456ebf73cabb5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_vocab_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "srs_interval" integer NOT NULL DEFAULT '1', "srs_ease" double precision NOT NULL DEFAULT '2.5', "srs_due_at" date NOT NULL, "total_reviews" integer NOT NULL DEFAULT '0', "correct_reviews" integer NOT NULL DEFAULT '0', "user_id" uuid, "vocab_id" uuid, CONSTRAINT "PK_9a14ba02a91024c87183a0ddc85" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_593273c40f818b0bcfc18a89d3" ON "user_vocab_progress"  ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_ac828cb9d7e30d9fe47939ecdd" ON "user_vocab_progress"  ("srs_due_at") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5fdf857be05a15107227372126" ON "user_vocab_progress"  ("user_id", "vocab_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sentences" ADD CONSTRAINT "FK_790c3f600b04e821eea070f86c1" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "xp_events" ADD CONSTRAINT "FK_4b4888f4cfa156c25fa21e2bc80" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_1f23e642cf6e009c61cc2c214e2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_8712591635416b27cdd8518346b" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "FK_5ce08039490cd0e619ae9560519" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "FK_4427002dcf362d61def4791adee" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_streaks" ADD CONSTRAINT "FK_91fc9bfd912d8ce3ae4be2ea193" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_638fa04490d2efbe3cf55a5e413" FOREIGN KEY ("source_lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_vocab_progress" ADD CONSTRAINT "FK_593273c40f818b0bcfc18a89d38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_vocab_progress" ADD CONSTRAINT "FK_690b0cf2dddbb927f02906d7d25" FOREIGN KEY ("vocab_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_vocab_progress" DROP CONSTRAINT "FK_690b0cf2dddbb927f02906d7d25"`);
    await queryRunner.query(`ALTER TABLE "user_vocab_progress" DROP CONSTRAINT "FK_593273c40f818b0bcfc18a89d38"`);
    await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_638fa04490d2efbe3cf55a5e413"`);
    await queryRunner.query(`ALTER TABLE "user_streaks" DROP CONSTRAINT "FK_91fc9bfd912d8ce3ae4be2ea193"`);
    await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_4427002dcf362d61def4791adee"`);
    await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_5ce08039490cd0e619ae9560519"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_8712591635416b27cdd8518346b"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_1f23e642cf6e009c61cc2c214e2"`);
    await queryRunner.query(`ALTER TABLE "xp_events" DROP CONSTRAINT "FK_4b4888f4cfa156c25fa21e2bc80"`);
    await queryRunner.query(`ALTER TABLE "sentences" DROP CONSTRAINT "FK_790c3f600b04e821eea070f86c1"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5fdf857be05a15107227372126"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ac828cb9d7e30d9fe47939ecdd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_593273c40f818b0bcfc18a89d3"`);
    await queryRunner.query(`DROP TABLE "user_vocab_progress"`);
    await queryRunner.query(`DROP TABLE "vocabularies"`);
    await queryRunner.query(`DROP TABLE "user_streaks"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ca7535b366966615043ad206d5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5ce08039490cd0e619ae956051"`);
    await queryRunner.query(`DROP TABLE "user_lesson_progress"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ceeb084f0baff9480df9ef114b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_36e3ec5afda139c95b81d96646"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8712591635416b27cdd8518346"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1f23e642cf6e009c61cc2c214e"`);
    await queryRunner.query(`DROP TABLE "attempts"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cbaf6ad50a6249dad9e344e651"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4b4888f4cfa156c25fa21e2bc8"`);
    await queryRunner.query(`DROP TABLE "xp_events"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9f337e64c6a597f336053f8d60"`);
    await queryRunner.query(`DROP TABLE "sentences"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ca2edfa23c965f9c435572a7de"`);
    await queryRunner.query(`DROP TABLE "lessons"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
  }
}
