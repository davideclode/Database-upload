import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  // Lembrando que estamos passando "path" do file no execute. Então precisamos recuperar o "filePathe"
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    // Criamos a Stream que estar lendo os nossos arquivos/nosso "filePath"
    const contactsReadStream = fs.createReadStream(filePath);

    // Vamos buscar do "csvParse"
    const parsers = csvParse({
      from_line: 2 /* Será criado csvParse a partir da linha 2, ou seja, será ignorado o título do arquivo csv */,
    });

    // O "pipe" permite ler as linhas conforme elas forem existindo
    const parseCSV = contactsReadStream.pipe(parsers);

    // Vamos criar as variáveis transactions e categories para salvar "title, type, value, category" nelas e depois fazer a inserção no banco de dados de uma forma mais compactada, ou seja, tudo de uma vez só. Esse tipo de método chama-se book insert"
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    // A cada parâmetro de line, estaremo desestruturando o "title","type", "value", "category" do line.map. E vamos ter que desestruturar cada celula(cell). E será retornado "cell.trim"
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      // Vamos verificar se cada um dos variáveis está chegando corretamente. Se pelo menos um estiver faltando então essa parte não vai passar. Poderiamos colocar o "category", mas ele não é obrigatório.
      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });
    // O "resolve" Vai verificar se o "parseCSV" emitiu um evento chamado "end"
    await new Promise(resolve => parseCSV.on('end', resolve));

    // Agora vamos mapear as categorias no nosso banco de dados, ou seja, buscar pelas categorias existentes.
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });
    // Agora que as categorias estão sendo encontradas vou fazer o "map" delas para ter só os títulos
    const existentCategoriesTitles = existentCategories.map(
      // "ategory" do tipo "Category" vai me retornar só o título(title)
      (category: Category) => category.title,
    );
    // Descobrindo categorias que não estão no banco de dados, ou seja, vamos buscar dentro de "existentCategoriesTitles" se uma determinada categoria existe no nosso banco de dados.
    // O segundo filter é para excluir a categoria duplicada. O "self" é o array de categorias
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // Agora vamos pegar as categorias que não existem e vamos colocá-las no nosso banco de dados.
    const newCategories = categoriesRepository.create(
      // Para cada categoria, vou adicionar/passar cada categoria
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    // Precisamos saber as categorias que foram enseridas e colocá-las aqui. Vamos utilizar o "Spread Operator" para passar as categorias que já existem e as novas categorias também
    const finalCategories = [...newCategories, ...existentCategories];

    // Agora vamos criar as nossas transações. Para cada transaction(transactions), vamos pegar o "transaction" e vamos retornar um objeto.
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          // Aqui, vou buscar uma category que tenha o mesmo. Quando a category do "finalCategories" tiver o mesmo título que a category do nosso "transactions.map(transaction =>({...})"
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
