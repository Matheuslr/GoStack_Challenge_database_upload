import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    category_title,
    title,
    type,
    value,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Outcome cannot be bigger than total balance');
    }

    let category = await categoryRepository.findOne({
      where: { title: category_title },
    });

    if (!category) {
      category = categoryRepository.create({ title: category_title });
      await categoryRepository.save(category);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
