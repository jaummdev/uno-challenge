const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");

/**
 * Gera um número inteiro para utilizar de id
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
    todoList: (_, { filter }) => {
      // Aqui você irá implementar o filtro dos itens
      console.log(filter);
      return TODO_LIST;
    },
  },
  Mutation: {
    addItem: (_, { values: { name } }) => {
      if (!name.trim()) return false; // Se o nome estiver em branco, não adiciona

      TODO_LIST.push({
        id: getRandomInt(),
        name,
      });

      return true; // Respeitando o squema
    },

    /**
     * Atualiza o nome de um item existente
     * @param {number} id - O id do item
     * @param {string} name - O novo nome do item
     */
    updateItem: (_, { values: { id, name } }) => {
      if (!name.trim()) return false; // Se o nome estiver em branco, não atualiza

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);

      if (itemIndex === -1) return false;

      TODO_LIST[itemIndex].name = name;
      return true;
    },

    deleteItem: (_, { id }) => {
      // Aqui você irá implementar a remoção do item
      console.log(id);
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
