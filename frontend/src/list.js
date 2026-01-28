import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import {
  Button,
  Checkbox,
  Snackbar,
  Stack,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_ITEM_MUTATION,
  GET_TODO_LIST,
  UPDATE_ITEM_MUTATION,
  DELETE_ITEM_MUTATION,
} from "./queries";
import {
  Delete,
  Edit,
  Check,
  Close,
  Add,
  FilterAlt,
} from "@mui/icons-material";
import { useState } from "react";
import { getOperationName } from "@apollo/client/utilities";
import {
  Container,
  ContainerTop,
  ContainerList,
  ContainerListItem,
  Title,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateSubtext,
} from "./styles/list.styles";

export default function CheckboxList() {
  const [item, setItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const { data, refetch } = useQuery(GET_TODO_LIST);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

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
      setSnackbar({
        open: true,
        severity: "success",
        message: "Tarefa adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erro ao adicionar tarefa",
      });
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
      setSnackbar({
        open: true,
        severity: "success",
        message: "Tarefa removida com sucesso",
      });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erro ao remover tarefa",
      });
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
      setSnackbar({
        open: true,
        severity: "success",
        message: "Tarefa atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erro ao atualizar tarefa",
      });
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
   * Alterna o status completed de um item
   * Realiza a chamada à mutação para atualizar o status 'completed' do item
   * Em caso de erro, exibe o erro no console
   * @param {number} id - O id do item
   * @param {boolean} currentCompleted - O status atual de 'completed' do item
   */
  const onToggleCompleted = async (id, currentCompleted) => {
    try {
      await updateItem({
        variables: {
          values: {
            id,
            completed: !currentCompleted,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      setSnackbar({
        open: true,
        severity: currentCompleted ? "warning" : "success",
        message: currentCompleted
          ? "Tarefa marcada como não completada"
          : "Tarefa marcada como completada",
      });
    } catch (error) {
      console.error("Erro ao concluir a tarefa:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erro ao concluir a tarefa",
      });
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
      <Title>TODO LIST</Title>
      <ContainerList>
        <ContainerTop onSubmit={onSubmit}>
          <TextField
            id="item"
            label="Digite aqui"
            value={item}
            type="text"
            variant="outlined"
            fullWidth
            InputProps={{
              sx: {
                borderRadius: "16px",
              },
            }}
            onChange={(e) => setItem(e?.target?.value)}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              type="submit"
              startIcon={<Add />}
              disableElevation
              sx={{ borderRadius: "16px", padding: "0 24px" }}
            >
              Salvar
            </Button>
            <Button
              variant="text"
              color="info"
              startIcon={<FilterAlt />}
              onClick={onFilter}
              sx={{ borderRadius: "16px", padding: "0 16px" }}
            >
              Filtrar
            </Button>
          </Stack>
        </ContainerTop>
        <List>
          <ContainerListItem>
            {!data?.todoList || data?.todoList?.length === 0 ? (
              <EmptyStateContainer>
                <EmptyStateIcon />
                <EmptyStateText>Nenhuma tarefa encontrada</EmptyStateText>
                <EmptyStateSubtext>
                  Adicione uma nova tarefa acima ou ajuste o filtro
                </EmptyStateSubtext>
              </EmptyStateContainer>
            ) : (
              data.todoList.map((value, index) => {
                const isEditing = editingId === value.id; // Verifica se o item está sendo editado

                return (
                  <ListItem key={value.id} disablePadding>
                    <ListItemButton
                      dense
                      sx={{
                        borderRadius: "8px",
                        padding: "4px 4px 4px 0",
                      }}
                    >
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
                            fullWidth
                            sx={{ margin: "0 4px" }}
                            InputProps={{
                              sx: {
                                borderRadius: "16px",
                              },
                            }}
                          />
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              color="success"
                              onClick={() => onUpdate(value.id)}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => {
                                setEditingId(null);
                                setEditName("");
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Stack>
                        </>
                      ) : (
                        // Modo Visualização
                        <>
                          <Checkbox
                            color="success"
                            checked={!!value?.completed}
                            onChange={() =>
                              onToggleCompleted(value.id, value.completed)
                            }
                          />
                          <ListItemText
                            id={index}
                            primary={value?.name}
                            sx={{
                              textDecoration: value?.completed
                                ? "line-through"
                                : "none",
                              opacity: value?.completed ? 0.5 : 1,
                            }}
                          />
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              color="default"
                              onClick={() =>
                                handleStartEdit(value.id, value.name)
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => onDelete(value.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </ContainerListItem>
        </List>
      </ContainerList>

      {/* Snackbar para exibir mensagens de sucesso ou erro */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() =>
          setSnackbar({ open: false, severity: "success", message: "" })
        }
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
