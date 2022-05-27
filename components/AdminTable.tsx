import * as React from 'react'
import {ReactNode} from 'react'
import {styled} from '@mui/system'
import TablePaginationUnstyled from '@mui/base/TablePaginationUnstyled'
import {blue, grey} from "@mui/material/colors"
import {Button, Link, Typography} from "@mui/material"
import {capitalize} from '../src/utils'

const Root = styled('div')(
    ({theme}) => `
  table {
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    text-align: left;
    padding: 6px;
  }

  th {
    /*background-color: ${theme.palette.mode === 'dark' ? grey[900] : grey[100]};*/
  }
  `,
)

const CustomTablePagination = styled(TablePaginationUnstyled)(
    ({theme}) => `
  & .MuiTablePaginationUnstyled-spacer {
    display: none;
  }
  & .MuiTablePaginationUnstyled-toolbar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }
  & .MuiTablePaginationUnstyled-selectLabel {
    margin: 0;
  }
  & .MuiTablePaginationUnstyled-select {
    padding: 2px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    border-radius: 50px;
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    }
    &:focus {
      outline: 1px solid ${theme.palette.mode === 'dark' ? blue[400] : blue[200]};
    }
  }
  & .MuiTablePaginationUnstyled-displayedRows {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }
  & .MuiTablePaginationUnstyled-actions {
    padding: 2px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    border-radius: 50px;
    text-align: center;
  }
  & .MuiTablePaginationUnstyled-actions > button {
    margin: 0 8px;
    border: transparent;
    border-radius: 2px;
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    }
    &:focus {
      outline: 1px solid ${theme.palette.mode === 'dark' ? blue[400] : blue[200]};
    }
  }
  `,
)

function orMail(str) {
    return typeof str?.length !== undefined && str?.map ?
        <div>{str?.map((x, i) => <div key={i} style={{marginBottom: 6}}>{x?.toString()}</div>)}</div>
        : str?.toString()?.includes("@") ? <Link href={"mailto:" + str}>{str?.toString()}</Link> : str
}

type EntryTableProps = {
    header?: string,
    rows: any[],
    cols: string[],
    search?: any,
    edit?: any,
    customCol?: string,
    customColFunction?: (a: any) => ReactNode,
    customCol2?: string,
    customColFunction2?: (a: any) => ReactNode,
    imgCol?: string
}

export default function EntryTable({
                                       header, rows, cols, search, edit,
                                       customCol, customColFunction, customCol2, customColFunction2, imgCol
                                   }: EntryTableProps) {
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(10)

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows?.length) : 0

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    return (
        <Root sx={{width: '100%'}} style={{opacity: rows ? 1 : 0}}>
            {!header ? "" : <Typography component="h1" variant="h5">{header}</Typography>}
            <table aria-label="custom pagination table">
                <thead>
                <tr>
                    {edit && <th/>}
                    {cols?.map(x => <th key={x}>{capitalize(x)}</th>)}
                </tr>
                </thead>
                <tbody>
                {(rowsPerPage > 0
                        ? rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : rows
                )?.map((row, i) => (
                    <tr key={"c" + i}>
                        {!edit ? "" : <td><Button onClick={() => edit(row)}>{'Edit'}</Button></td>}

                        {cols.map(x =>
                            <td key={x}>
                                {
                                    imgCol === x ? <div style={{height: 120, width: 120}}>
                                            <img width="120" src={row[x]} alt=""/>
                                        </div>
                                        : customCol === x ? customColFunction(row)
                                            : customCol2 === x ? customColFunction2(row)
                                                : row[x]?.__type
                                                    ? <Button onClick={() => search("id:" + row[x].objectId)}>
                                                        {row[x].objectId?.toString()}</Button>
                                                    : orMail(row[x])}</td>)}
                        {/* <td>{row.name}</td>
                        <td>{row["name"]}</td>
                        <td style={{width: 120}} align="right">
                            {JSON.stringify(row.b)}
                        </td>
                        <td style={{width: 120}} align="right">
                            {JSON.stringify(row.creator)}
                        </td>*/}
                    </tr>
                ))}

                {emptyRows > 0 && (
                    <tr style={{height: 41 * emptyRows}}>
                        <td colSpan={3}/>
                    </tr>
                )}
                </tbody>
                <tfoot>
                <tr>
                    <CustomTablePagination
                        rowsPerPageOptions={[5, 10, 25, {label: 'All', value: -1}]}
                        colSpan={edit ? cols.length - 1 : cols.length}
                        count={rows?.length ?? 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        componentsProps={{
                            select: {
                                'aria-label': 'rows per page',
                            }
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </tr>
                </tfoot>
            </table>
        </Root>
    )
}
