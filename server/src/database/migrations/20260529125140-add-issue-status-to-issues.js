'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. CREATE USERS TABLE
    await queryInterface.createTable('users', {
      uuid: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      gmail: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      phone_number: { type: Sequelize.STRING },
      role: { type: Sequelize.ENUM('READER', 'LIBRARIAN', 'ADMIN'), allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. CREATE BOOKS TABLE
    await queryInterface.createTable('books', {
      book_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      book_name: { type: Sequelize.STRING, allowNull: false },
      book_author: { type: Sequelize.STRING, allowNull: false },
      category_id: { type: Sequelize.UUID, allowNull: true },
      total_copies: { type: Sequelize.INTEGER, defaultValue: 0 },
      available_copies: { type: Sequelize.INTEGER, defaultValue: 0 },
      lending_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 3. CREATE MEMBERS TABLE
    await queryInterface.createTable('members', {
      member_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'uuid' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      membership_plan_id: { type: Sequelize.UUID, allowNull: true },
      start_date: { type: Sequelize.DATEONLY },
      expiry_date: { type: Sequelize.DATEONLY },
      membership_status: { type: Sequelize.ENUM('ACTIVE', 'EXPIRED'), allowNull: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 4. CREATE ISSUES TABLE
    await queryInterface.createTable('issues', {
      issue_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'members', key: 'member_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'books', key: 'book_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      borrowed_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      returned_date: { type: Sequelize.DATEONLY, allowNull: true },
      issue_status: { 
        type: Sequelize.ENUM('BORROWED', 'RETURNED', 'OVERDUE'), 
        defaultValue: 'BORROWED', 
        allowNull: false 
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 5. CREATE FINES TABLE
    await queryInterface.createTable('fines', {
      fine_id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'issues', key: 'issue_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      delayed_days: { type: Sequelize.INTEGER, defaultValue: 0 },
      fine_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      paid_status: { type: Sequelize.BOOLEAN, defaultValue: false },
      paid_date: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to avoid foreign key violations
    await queryInterface.dropTable('fines');
    await queryInterface.dropTable('issues');
    await queryInterface.dropTable('members');
    await queryInterface.dropTable('books');
    await queryInterface.dropTable('users');
    
    // Clean up Postgres ENUM types explicitly
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_members_membership_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_issues_issue_status";');
  }
};