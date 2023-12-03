import "./datatable.css";
import SearchBar from "./SearchBar.jsx";
import { columns } from "../utility/tabledata.js";
import {
  DataGrid,
  GridRowModes,
  GridActionsCellItem,
  GridRowEditStopReasons,
  useGridApiContext,
  useGridSelector,
  gridPageCountSelector,
  gridPageSelector,
} from "@mui/x-data-grid";
import { Pagination, PaginationItem, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

const Datatable = ({
  originalData,
  handleDeleteMultiple,
  handleDeleteSingle,
}) => {

  const [rows, setRows] = useState(originalData);
  const [input, setInput] = useState("");
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  useEffect(() => {
    setRows(originalData);
  }, [originalData]);

  const searchHandler = (userInput) => {
    setInput(userInput);
  };

  const deleteHandler = () => {
    handleDeleteMultiple(rowSelectionModel);
  };

  const actionsColumn = [
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
                
              }}
              onClick={handleSaveClick(params.id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(params.id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(params.id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(params.id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const [rowModesModel, setRowModesModel] = useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    handleDeleteSingle(id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
        page={page + 1}
        count={pageCount}
        renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
      />
    );
  }

  return (
    <div className="datatable">
      <div className="datatableTitle">
        <SearchBar searchHandler={searchHandler} />
        <button onClick={deleteHandler} className="button">
          <DeleteIcon />
        </button>
      </div>
      <DataGrid
        className="datagrid"
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        slots={{
          pagination: CustomPagination,
        }}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              No User Found !!
            </Stack>
          ),
        }}
        sx={{
          "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
          "&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        }}
        checkboxSelection
        getRowClassName={(params) => `fade-in-row`}
        showCellVerticalBorder
        showColumnVerticalBorder
        autoHeight
        rows={rows.filter((user) => {
          if (input === "") return user;
          return (
            user.name.toLowerCase().includes(input.toLowerCase()) ||
            user.email.toLowerCase().includes(input.toLowerCase()) ||
            user.role.toLowerCase().includes(input.toLowerCase())
          );
        })}
        columns={columns.concat(actionsColumn)}
        pageSizeOptions={[10]}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
      />
    </div>
  );
};

export default Datatable;
