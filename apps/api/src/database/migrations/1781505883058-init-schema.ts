import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1781505883058 implements MigrationInterface {
  name = 'InitSchema1781505883058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "email_auth_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "purpose" character varying(20) NOT NULL, "token_hash" character varying(64) NOT NULL, "email" character varying(255) NOT NULL, "user_id" uuid, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_131c7b9a7cf5262284a2c75b3c5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_017acfe750b6134432d06c6220" ON "email_auth_tokens"  ("token_hash") `
    );
    await queryRunner.query(`CREATE INDEX "IDX_2370cfb46683b213bdc8c91a21" ON "email_auth_tokens"  ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_cccf96c18391682fdf72436d5d" ON "email_auth_tokens"  ("expires_at") `);
    await queryRunner.query(
      `CREATE TABLE "storage_objects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "key" character varying(600) NOT NULL, "bucket" character varying(120) NOT NULL, "content_type" character varying(160) NOT NULL, "size_bytes" bigint NOT NULL, "url" text NOT NULL, "etag" character varying(120), "source" character varying(120), "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_c35194bd3fa07c4733c0fd55fda" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e6001f0e21fe451b3dba13fbac" ON "storage_objects"  ("key") `);
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "daily_goal_sentences" smallint NOT NULL DEFAULT '10', "push_token" character varying(255), "notification_enabled" boolean NOT NULL DEFAULT true, "reminder_hour" smallint NOT NULL DEFAULT '19', "timezone" character varying(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', "user_id" uuid, CONSTRAINT "REL_4ed056b9344e6f7d8d46ec4b30" UNIQUE ("user_id"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying(255) NOT NULL, "password_hash" text, "email_verified_at" TIMESTAMP WITH TIME ZONE, "google_id" character varying(255), "display_name" character varying(120) NOT NULL, "avatar_url" text, "xp_total" integer NOT NULL DEFAULT '0', "level_rank" character varying(40) NOT NULL DEFAULT 'Beginner', "avatar_object_id" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cb3a7c59ffdb91d1f5de6717af" ON "users"  ("google_id") WHERE "google_id" IS NOT NULL`
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "ip_address" character varying(64), "user_agent" text, "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_abaa9e068cdd390bc5210f7988" ON "sessions"  ("token_hash") `);
    await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions"  ("user_id") `);
    await queryRunner.query(
      `CREATE TABLE "topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "slug" character varying(120) NOT NULL, "title" character varying(160) NOT NULL, "cefr_level" character varying(20) NOT NULL DEFAULT 'beginner', "sort_order" integer NOT NULL DEFAULT '0', "description" text, "category_id" uuid NOT NULL, CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97c66ab0029f49fde30517f819" ON "topics"  ("slug") `);
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "slug" character varying(120) NOT NULL, "title" character varying(160) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "description" text, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories"  ("slug") `);
    await queryRunner.query(
      `CREATE TABLE "sentences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order" integer NOT NULL DEFAULT '0', "text" text NOT NULL, "ipa" character varying(300), "translation" text, "audio_url" text, "audio_object_id" uuid, "lesson_id" uuid, CONSTRAINT "PK_9b3aec16318cf425aaddad6dd5f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_9f337e64c6a597f336053f8d60" ON "sentences"  ("lesson_id", "order") `);
    await queryRunner.query(
      `CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "slug" character varying(160) NOT NULL, "title" character varying(240) NOT NULL, "description" text, "level" character varying(20) NOT NULL DEFAULT 'beginner', "source" character varying(120), "external_url" character varying(600), "media_kind" character varying(20), "topic_id" uuid, "media_object_id" uuid, CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ca2edfa23c965f9c435572a7de" ON "lessons"  ("slug") `);
    await queryRunner.query(
      `CREATE TABLE "xp_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" smallint NOT NULL, "source_type" character varying(40) NOT NULL, "source_id" uuid, "user_id" uuid, CONSTRAINT "PK_ff53781040f34f17bddeae20f4a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_4b4888f4cfa156c25fa21e2bc8" ON "xp_events"  ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_cbaf6ad50a6249dad9e344e651" ON "xp_events"  ("user_id", "created_at") `);
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" character varying(40) NOT NULL, "title" character varying(160) NOT NULL, "body" text NOT NULL, "data" jsonb, "read_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications"  ("user_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications"  ("user_id", "created_at") `
    );
    await queryRunner.query(
      `CREATE TABLE "attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "mode" character varying(20) NOT NULL, "self_assessment" character varying(10) NOT NULL, "srs_interval" integer NOT NULL DEFAULT '1', "srs_ease" double precision NOT NULL DEFAULT '2.5', "srs_due_at" date NOT NULL, "recording_url" text, "ai_score" jsonb, "attempted_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, "sentence_id" uuid, "recording_object_id" uuid, CONSTRAINT "PK_295ca261e361fd2fd217754dcac" PRIMARY KEY ("id"))`
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
      `CREATE TABLE "vocabularies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "word" character varying(120) NOT NULL, "meaning_vn" text NOT NULL, "meaning_en" text, "ipa" character varying(200), "synonyms" jsonb NOT NULL DEFAULT '[]', "example_sentences" jsonb NOT NULL DEFAULT '[]', "level" character varying(20) NOT NULL DEFAULT 'beginner', "audio_url" text, "topic_id" uuid, "audio_object_id" uuid, "source_lesson_id" uuid, CONSTRAINT "PK_1f0c8d5539ccaf456ebf73cabb5" PRIMARY KEY ("id"))`
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
      `ALTER TABLE "users" ADD CONSTRAINT "FK_35ceda9ec6cd34e51ca2dc635f7" FOREIGN KEY ("avatar_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "topics" ADD CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sentences" ADD CONSTRAINT "FK_1ab73ee4c830f1883bebeda6fd3" FOREIGN KEY ("audio_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sentences" ADD CONSTRAINT "FK_790c3f600b04e821eea070f86c1" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_1dc6a3509df72e37a9282f67965" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_f1032240b20721ce80d3e793fef" FOREIGN KEY ("media_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "xp_events" ADD CONSTRAINT "FK_4b4888f4cfa156c25fa21e2bc80" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_1f23e642cf6e009c61cc2c214e2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_8712591635416b27cdd8518346b" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_e9623741f9efdb1030291d4fa7e" FOREIGN KEY ("recording_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
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
      `ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_bb12cc93333f030622297ea1ea6" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_37ede8ff6bdc2a59cae21439a68" FOREIGN KEY ("audio_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
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
    await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_37ede8ff6bdc2a59cae21439a68"`);
    await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_bb12cc93333f030622297ea1ea6"`);
    await queryRunner.query(`ALTER TABLE "user_streaks" DROP CONSTRAINT "FK_91fc9bfd912d8ce3ae4be2ea193"`);
    await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_4427002dcf362d61def4791adee"`);
    await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_5ce08039490cd0e619ae9560519"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_e9623741f9efdb1030291d4fa7e"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_8712591635416b27cdd8518346b"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_1f23e642cf6e009c61cc2c214e2"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
    await queryRunner.query(`ALTER TABLE "xp_events" DROP CONSTRAINT "FK_4b4888f4cfa156c25fa21e2bc80"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_f1032240b20721ce80d3e793fef"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_1dc6a3509df72e37a9282f67965"`);
    await queryRunner.query(`ALTER TABLE "sentences" DROP CONSTRAINT "FK_790c3f600b04e821eea070f86c1"`);
    await queryRunner.query(`ALTER TABLE "sentences" DROP CONSTRAINT "FK_1ab73ee4c830f1883bebeda6fd3"`);
    await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_35ceda9ec6cd34e51ca2dc635f7"`);
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
    await queryRunner.query(`DROP INDEX "public"."IDX_310667f935698fcd8cb319113a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cbaf6ad50a6249dad9e344e651"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4b4888f4cfa156c25fa21e2bc8"`);
    await queryRunner.query(`DROP TABLE "xp_events"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ca2edfa23c965f9c435572a7de"`);
    await queryRunner.query(`DROP TABLE "lessons"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9f337e64c6a597f336053f8d60"`);
    await queryRunner.query(`DROP TABLE "sentences"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97c66ab0029f49fde30517f819"`);
    await queryRunner.query(`DROP TABLE "topics"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_abaa9e068cdd390bc5210f7988"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cb3a7c59ffdb91d1f5de6717af"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e6001f0e21fe451b3dba13fbac"`);
    await queryRunner.query(`DROP TABLE "storage_objects"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cccf96c18391682fdf72436d5d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2370cfb46683b213bdc8c91a21"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_017acfe750b6134432d06c6220"`);
    await queryRunner.query(`DROP TABLE "email_auth_tokens"`);
  }
}
