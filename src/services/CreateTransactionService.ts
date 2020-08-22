import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category'; /* Importação da model Category */

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
    /* Ele vai criar repository a partir da nossa model Category passando a model Category */
    const categoryRepository = getRepository(Category);

    // Criando a regra que: Não pode haver "outcome" sem um saldo(balance) válido
    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have anough balance");
    }

    // Verificar se há no DB registro que tenha título(title) chamado "category"
    let transactionCategory = await categoryRepository.findOne({
      where: {
        // Quando título da categoria é igual ao nome da categoria
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
