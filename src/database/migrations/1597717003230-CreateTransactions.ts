// import { uuid } from 'uuidv4';
import {MigrationInterface, QueryRunner, Table} from "typeorm";

export default class CreateTransactions1597717003230 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'transactions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'title',
              type: 'varchar',
            },
            {
              name: 'type',
              type: 'varchar',
            },
            {
              name: 'value',
              type: 'decimal', /* No postgress, o "decimal" recebe dois parâmetros: precision e  */
              precision: 10,
              scale: 2,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('transactions');
    }

}

/*
No postgress, o "decimal" recebe dois parâmetros:
- precision: indica quantos dígitos o nosso valor pode ter.
- scale: indica os dígitos do lado direito, ou seja, casas decimais. Exemplo: 10000000,02
*/
