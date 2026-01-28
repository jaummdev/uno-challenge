import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Button, TextField } from "@mui/material";
import { styled } from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_ITEM_MUTATION,
  GET_TODO_LIST,
  UPDATE_ITEM_MUTATION,
  DELETE_ITEM_MUTATION,
} from "./queries";
import { Delete, Edit, Check, Close } from "@mui/icons-material";
import { useState } from "react";
import { getOperationName } from "@apollo/client/utilities";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ContainerTop = styled.form`
  display: flex;
  background-color: #dcdcdc;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;

const ContainerList = styled.div`
  display: flex;
  width: 600px;
  background-color: #dcdcdc;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;
const ContainerListItem = styled.div`
  background-color: #efefef;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px;
  overflow: auto;
`;

const ContainerButton = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 10px;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 28px;
`;

export default function CheckboxList() {
  const [item, setItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const { data, refetch } = useQuery(GET_TODO_LIST);

  const [addItem] = useMutation(ADD_ITEM_MUTATION);
  const [updateItem] = useMutation(UPDATE_ITEM_MUTATION);
  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION);

  /**
   * Gerencia o envio do formulário para adicionar um novo item
   * Realiza a validação de campo vazio e chama a mutação para adicionar o item
   * Após o sucesso, limpa o campo de entrada e refaz a consulta à lista
   * Em caso de erro, exibe o erro no console
   * @param {Event} event - O evento de submit do formulário
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    if (!item.trim()) return; // Se o nome estiver em branco, não adiciona

    try {
      await addItem({
        variables: {
          values: {
            name: item,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      setItem("");
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  /**
   * Gerencia a remoção de um item da lista
   * Realiza a chamada à mutação para remover o item e refaz a consulta à lista
   * Em caso de erro, exibe o erro no console
   * @param {number} id - O id do item
   */
  const onDelete = async (id) => {
    try {
      await deleteItem({
        variables: {
          id,
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  /**
   * Gerencia a atualização do nome de um item
   * Realiza a chamada à mutação para atualizar o item e refaz a consulta à lista
   * Em caso de erro, exibe o erro no console
   * @param {number} id - O id do item
   */
  const onUpdate = async (id) => {
    if (!editName.trim()) return; // Se o nome estiver em branco, não atualiza

    try {
      await updateItem({
        variables: {
          values: {
            id,
            name: editName,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });

      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
    }
  };

  /**
   * Realiza a filtragem dos itens chamando o backend.
   * Utiliza o valor atual do input ('item') como critério de busca.
   * Se o input estiver vazio, o backend retornará a lista completa.
   */
  const onFilter = async () => {
    try {
      await refetch({
        filter: {
          name: item,
        },
      });
    } catch (error) {
      console.error("Erro ao filtrar item:", error);
    }
  };

  /**
   * Gerencia o início do modo de edição de um item
   * Define o id e o nome do item para edição
   * @param {number} id - O id do item
   * @param {string} currentName - O nome atual do item
   */
  const handleStartEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  return (
    <Container>
      <ContainerList>
        <Title>TODO LIST</Title>
        <ContainerTop onSubmit={onSubmit}>
          <TextField
            id="item"
            label="Digite aqui"
            value={item}
            type="text"
            variant="standard"
            onChange={(e) => setItem(e?.target?.value)}
          />
          <ContainerButton>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="info"
              onClick={onFilter}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="success"
              type="submit"
            >
              Salvar
            </Button>
          </ContainerButton>
        </ContainerTop>
        <List sx={{ width: "100%" }}>
          <ContainerListItem>
            {data?.todoList?.map((value, index) => {
              const isEditing = editingId === value.id; // Verifica se o item está sendo editado
              return (
                <ListItem
                  key={value.id}
                  disablePadding
                  sx={{
                    borderRadius: "5px",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <ListItemButton dense>
                    {isEditing ? (
                      // Modo Edição
                      <>
                        <TextField
                          value={editName}
                          autoFocus
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onUpdate(value.id);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditName("");
                            }
                          }}
                          sx={{ width: "100%" }}
                        />
                        <Check
                          color="success"
                          onClick={() => onUpdate(value.id)}
                          sx={{ cursor: "pointer", marginLeft: 1 }}
                        />
                        <Close
                          color="error"
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                          sx={{ cursor: "pointer", marginLeft: 1 }}
                        />
                      </>
                    ) : (
                      // Modo Visualização
                      <>
                        <ListItemText id={index} primary={value?.name} />
                        <Edit
                          onClick={() => handleStartEdit(value.id, value.name)}
                          sx={{ cursor: "pointer", marginLeft: 1 }}
                        />
                        <Delete onClick={() => onDelete(value.id)} />
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </ContainerListItem>
        </List>
      </ContainerList>
    </Container>
  );
}
