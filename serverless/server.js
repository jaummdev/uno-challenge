const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");
const { GraphQLError } = require("graphql");

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
    completed: Boolean
  }

  input ItemInput {
    id: Int
    name: String
    completed: Boolean
  }

  input ItemFilter {
    id: Int
    name: String
    completed: Boolean
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
     * @throws {GraphQLError} Se o nome for vazio ou se o nome já estiver em uso
     */
    addItem: (_, { values: { name } }) => {
      const cleanName = name.trim();
      if (!cleanName) {
        throw new GraphQLError("Nome não pode ser vazio.", {
          extensions: {
            code: "NAME_EMPTY",
          },
        });
      }

      const exists = TODO_LIST.some(
        (item) => item.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (exists) {
        throw new GraphQLError("Já existe um item com este nome.", {
          extensions: {
            code: "NAME_ALREADY_USED",
          },
        });
      }

      TODO_LIST.push({
        id: getRandomInt(),
        name: cleanName,
        completed: false,
      });

      return true; // Respeitando o squema
    },

    /**
     * Atualiza um item existente (nome e/ou status completed)
     * Regras: Não permite nomes vazios nem duplicados quando atualizando o nome.
     * Permite atualizar apenas o status completed sem alterar o nome.
     * @param {number} id - O id do item
     * @param {string} name - O novo nome do item
     * @param {boolean} completed - O status 'completed' do item
     * @returns {boolean} true se o item foi atualizado com sucesso, false caso contrário
     * @throws {GraphQLError} Se o id for vazio, se o item não for encontrado, se o nome for vazio ou se o nome já estiver em uso
     */
    updateItem: (_, { values: { id, name, completed } }) => {
      if (!id) {
        throw new GraphQLError("Id não pode ser vazio.", {
          extensions: {
            code: "ID_EMPTY",
          },
        });
      }

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);
      if (itemIndex === -1) {
        throw new GraphQLError("Item não encontrado.", {
          extensions: {
            code: "ITEM_NOT_FOUND",
          },
        });
      }

      // Se name foi fornecido, valida e atualiza
      if (name !== undefined && name !== null) {
        const cleanName = name.trim();
        if (!cleanName) {
          throw new GraphQLError("Nome não pode ser vazio.", {
            extensions: {
              code: "NAME_EMPTY",
            },
          });
        }

        const isDuplicate = TODO_LIST.some(
          (item) =>
            item.name.toLowerCase() === cleanName.toLowerCase() &&
            item.id !== id
        );

        if (isDuplicate) {
          throw new GraphQLError("Já existe um item com este nome.", {
            extensions: {
              code: "NAME_ALREADY_USED",
            },
          });
        }

        TODO_LIST[itemIndex].name = cleanName;
      }

      // Se completed foi fornecido, atualiza
      if (completed !== undefined && completed !== null) {
        TODO_LIST[itemIndex].completed = completed;
      }

      return true;
    },

    /**
     * Remove um item da lista
     * Regras: Não permite remover um item que não existe.
     * @param {number} id - O id do item
     * @returns {boolean} true se o item foi removido com sucesso, false caso contrário
     * @throws {GraphQLError} Se o id for vazio ou o item não for encontrado
     */
    deleteItem: (_, { id }) => {
      if (!id) {
        throw new GraphQLError("Id não pode ser vazio.", {
          extensions: {
            code: "ID_EMPTY",
          },
        });
      }

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        throw new GraphQLError("Item não encontrado.", {
          extensions: {
            code: "ITEM_NOT_FOUND",
          },
        });
      }

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
