import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStorageAndMedia1781248693090 implements MigrationInterface {
  name = 'AddStorageAndMedia1781248693090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "storage_objects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "key" character varying(600) NOT NULL, "bucket" character varying(120) NOT NULL, "content_type" character varying(160) NOT NULL, "size_bytes" bigint NOT NULL, "url" text NOT NULL, "etag" character varying(120), "source" character varying(120), "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_c35194bd3fa07c4733c0fd55fda" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e6001f0e21fe451b3dba13fbac" ON "storage_objects"  ("key") `);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_object_id" uuid`);
    await queryRunner.query(`ALTER TABLE "lessons" ADD "external_url" character varying(600)`);
    await queryRunner.query(`ALTER TABLE "lessons" ADD "media_kind" character varying(20)`);
    await queryRunner.query(`ALTER TABLE "lessons" ADD "media_object_id" uuid`);
    await queryRunner.query(`ALTER TABLE "sentences" ADD "audio_object_id" uuid`);
    await queryRunner.query(`ALTER TABLE "attempts" ADD "recording_object_id" uuid`);
    await queryRunner.query(`ALTER TABLE "vocabularies" ADD "audio_object_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_35ceda9ec6cd34e51ca2dc635f7" FOREIGN KEY ("avatar_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_f1032240b20721ce80d3e793fef" FOREIGN KEY ("media_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "sentences" ADD CONSTRAINT "FK_1ab73ee4c830f1883bebeda6fd3" FOREIGN KEY ("audio_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "FK_e9623741f9efdb1030291d4fa7e" FOREIGN KEY ("recording_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_37ede8ff6bdc2a59cae21439a68" FOREIGN KEY ("audio_object_id") REFERENCES "storage_objects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_37ede8ff6bdc2a59cae21439a68"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_e9623741f9efdb1030291d4fa7e"`);
    await queryRunner.query(`ALTER TABLE "sentences" DROP CONSTRAINT "FK_1ab73ee4c830f1883bebeda6fd3"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_f1032240b20721ce80d3e793fef"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_35ceda9ec6cd34e51ca2dc635f7"`);
    await queryRunner.query(`ALTER TABLE "vocabularies" DROP COLUMN "audio_object_id"`);
    await queryRunner.query(`ALTER TABLE "attempts" DROP COLUMN "recording_object_id"`);
    await queryRunner.query(`ALTER TABLE "sentences" DROP COLUMN "audio_object_id"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "media_object_id"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "media_kind"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "external_url"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_object_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e6001f0e21fe451b3dba13fbac"`);
    await queryRunner.query(`DROP TABLE "storage_objects"`);
  }
}
