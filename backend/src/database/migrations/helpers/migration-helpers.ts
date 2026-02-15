import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Helper to add standard timestamp columns (createdAt, updatedAt)
 */
export function addTimestamps() {
  return {
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  };
}

/**
 * Helper to safely add a column (checks if it exists first)
 * Useful for zero-downtime migrations
 */
export async function safeAddColumn(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  columnDefinition: any
): Promise<void> {
  const tableDescription = await queryInterface.describeTable(tableName);
  
  if (!tableDescription[columnName]) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition);
    console.log(`Added column ${columnName} to ${tableName}`);
  } else {
    console.log(`Column ${columnName} already exists in ${tableName}, skipping`);
  }
}

/**
 * Helper to safely remove a column (checks if it exists first)
 */
export async function safeRemoveColumn(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string
): Promise<void> {
  const tableDescription = await queryInterface.describeTable(tableName);
  
  if (tableDescription[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
    console.log(`Removed column ${columnName} from ${tableName}`);
  } else {
    console.log(`Column ${columnName} does not exist in ${tableName}, skipping`);
  }
}

/**
 * Helper to add foreign key constraint with standard options
 */
export async function addForeignKey(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  referencedTable: string,
  referencedColumn: string = 'id',
  onDelete: string = 'CASCADE',
  onUpdate: string = 'CASCADE'
): Promise<void> {
  await queryInterface.addConstraint(tableName, {
    fields: [columnName],
    type: 'foreign key',
    name: `fk_${tableName}_${columnName}`,
    references: {
      table: referencedTable,
      field: referencedColumn,
    },
    onDelete,
    onUpdate,
  });
}

/**
 * Helper to remove foreign key constraint
 */
export async function removeForeignKey(
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string
): Promise<void> {
  await queryInterface.removeConstraint(
    tableName,
    `fk_${tableName}_${columnName}`
  );
}
