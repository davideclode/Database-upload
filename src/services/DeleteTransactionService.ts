import { response } from 'express';
import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    // Não foi pedido no desafio. Vamos do banco de dados. Se ele existe, então a gente deleta. Se não não existe, então a gente rotarna um erro.
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionsRepository.findOne(id);

    // Se não existir faça:
    if (!transaction) {
      throw new AppError("Transaction dosen't exist!!!");
    }
    // Se existir, então faça:
    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
