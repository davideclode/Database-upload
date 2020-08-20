// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  // Informar dados da transação aqui
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    /* Ele vai criar repository a partir da nossa model */
    const categoryRepository = getRepository(Category);

    // Verificar se a categoria já existe
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    // Existe? Então buscar ela do banco de dados e usar o id que retornado

    // Não existe? Então crie essa categoria
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
