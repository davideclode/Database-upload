import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class AddCategoryIdToTransactions1597721181831 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'category_id',
          type: 'uuid',
          isNullable: true,
        })
      );
      // Aqui, temos que informar que a coluna "category_id" é uma chave estrangeira
      await queryRunner.createForeignKey(
        'transactions',
        new TableForeignKey({
          columnNames: [ 'category_id'], /* Nome da coluna que está na nossa tabela transactions */
          referencedColumnNames: ['id'], /* Lá na tabela categories, estaremos referenciando a coluna "id" */
          referencedTableName: 'categories', /* A tabela que estamos referenciando */
          name: 'TransactionCategory', /* Apelido da nossa chave estrangeira */
          onUpdate: 'CASCADE', /* Sempre que atualizar em uma tabela, atualize também na outra */
          onDelete: 'SET NELL',
        }),
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      // Ordem de deletar: 1º chave estrangeira; 2º a coluna

      /* Vamos deletar a chave estrangeira que acamos de criar. Lembrando que precisamos passar 1º o nome da tabela e 2º o nome/apelido da chave estrangeira */
      await queryRunner.dropForeignKey('transactions', 'TransactionCAtegory');

      /* E agora vamos deletar também a coluna. Lembrando que precisamos passar 1º o nome da tabela e 2º o nome da coluna*/
      await queryRunner.dropColumn('transactions', 'category_id');
    }

}


/*
onDelete: Sempre que deletarmos uma determinada categoria, vai acontecer que a tabela transaction será setado como NULL
*/
