const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");

/**
 * Gera um número inteiro para utilizar de id
 * PROBLEMA: O número gerado é aleatório, o que pode causar problemas duplicidade.
 * SOLUÇÃO: Usar UUID para gerar o id. (Usando slice para reduzir o tamanho do id).
 * Mantive da forma que estava seguir a regra de seguir o padrão já pré-estabelecido no projeto.
 */
function getRandomInt() {
  return Math.floor(Math.random() * 999);
}

const typeDefs = `#graphql
  type Item {
    id: Int
    name: String
  }

  input ItemInput {
    id: Int
    name: String
  }

  input ItemFilter {
    id: Int
    name: String
  }

  type Query {
    todoList(filter: ItemFilter): [Item]
  }

  type Mutation {
    addItem(values: ItemInput): Boolean
    updateItem(values: ItemInput): Boolean
    deleteItem(id: Int!): Boolean
  }
`;

const resolvers = {
  Query: {
    /**
     * Retorna a lista de itens
     * Regras: Se o filtro for fornecido, filtra os itens pelo nome.
     * @param {object} filter - O filtro para filtrar os itens
     * @returns {array} A lista de itens
     */
    todoList: (_, { filter }) => {
      if (filter && filter.name) {
        return TODO_LIST.filter((item) =>
          item.name.toLowerCase().includes(filter.name.toLowerCase())
        );
      }

      return TODO_LIST;
    },
  },
  Mutation: {
    /**
     * Adiciona um novo item à lista
     * Regras: Não permite nomes vazios nem duplicados.
     * @param {string} name - O nome do item
     * @returns {boolean} true se o item foi adicionado com sucesso, false caso contrário
     */
    addItem: (_, { values: { name } }) => {
      const cleanName = name.trim();
      if (!cleanName) return false;

      const exists = TODO_LIST.some(
        (item) => item.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (exists) {
        throw new Error("Já existe um item com este nome.");
      }

      TODO_LIST.push({
        id: getRandomInt(),
        name: cleanName,
      });

      return true; // Respeitando o squema
    },

    /**
     * Atualiza o nome de um item existente
     * Regras: Não permite nomes vazios nem duplicados.
     * @param {number} id - O id do item
     * @param {string} name - O novo nome do item
     * @returns {boolean} true se o item foi atualizado com sucesso, false caso contrário
     */
    updateItem: (_, { values: { id, name } }) => {
      const cleanName = name.trim();
      if (!cleanName) return false;

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);
      if (itemIndex === -1) return false;

      const isDuplicate = TODO_LIST.some(
        (item) =>
          item.name.toLowerCase() === cleanName.toLowerCase() && item.id !== id
      );
      if (isDuplicate) throw new Error("Nome já utilizado em outra tarefa.");

      TODO_LIST[itemIndex].name = cleanName;
      return true;
    },

    /**
     * Remove um item da lista
     * Regras: Não permite remover um item que não existe.
     * @param {number} id - O id do item
     * @returns {boolean} true se o item foi removido com sucesso, false caso contrário
     */
    deleteItem: (_, { id }) => {
      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);

      if (itemIndex === -1) return false;

      TODO_LIST.splice(itemIndex, 1);

      return true;
    },
  },
};

// Configuração para subir o backend
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
