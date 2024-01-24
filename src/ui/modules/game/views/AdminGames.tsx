"use client";

import React, { useEffect, useReducer } from "react";
import AddGame from "@/ui/modules/game/features/AddGame";
import { useSession } from "next-auth/react";
import gzRequest from "@/lib/utils/gzRequest";
import Table from "@/ui/components/table/Table";
import SelectInput from "@/ui/components/form/SelectInput";
import TextInput from "@/ui/components/form/TextInput";
import Button from "@/ui/components/common/Button";
import TableFooter from "@/ui/components/table/TableFooter";
import TableHOC from "@/ui/components/table/TableHOC";
import TableBodyCell from "@/ui/components/table/TableBodyCell";
import ModalHOC from "@/ui/components/modal/ModalHOC";
import EditIcon from "@/ui/components/common/icons/EditIcon";
import DeleteIcon from "@/ui/components/common/icons/DeleteIcon";
import EditGame from "../features/EditGame";
import DeleteGame from "../features/DeleteGame";
import Link from "next/link";
import { v4 as uuid4 } from "uuid";

const AdminGames = () => {
  const { data: session, status: authStatus } = useSession();

  const [state, dispatch] = useReducer(reducer, initialState);

  // prettier-ignore
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    event.preventDefault();
    dispatch({ type: "SET_QUERY", queryPaylod: { ...state.query, [event.target.name]: event.target.value } })
  };

  // prettier-ignore
  const updateGame = (game: Game, actionType: "UPDATE_GAME" | "APPEND_GAME") => {
    dispatch({ type: actionType, gamePaylod: game });
  }

  useEffect(() => {
    if (authStatus === "loading") return () => {};

    const timeOutId = setTimeout(() => {
      dispatch({ type: "LOADING", paylod: true });
    }, 150);

    dispatch({ type: "SET_MESSAGES", paylod: "" });

    fetchGames(state.query, session?.auth?.token)
      .then((res: GZResponse<GZPage<Game>>) => {
        if (res.ok && res.result) {
          dispatch({ type: "SET_PAGE", pagePaylod: res.result });
        } else {
          dispatch({
            type: "SET_MESSAGES",
            paylod: res?.error?.errorMessage ?? "Somthing Went Wrong !",
          });
        }
      })
      .finally(() => {
        clearTimeout(timeOutId);
        setTimeout(() => {
          dispatch({ type: "LOADING", paylod: false });
        }, 150);
      });

    return () => {};
  }, [state.query, authStatus]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-1">
          <div>
            <h2 className="text-2xl font-semibold leading-tight">Games</h2>
          </div>
          <div className="flex sm:flex-row flex-col justify-between items-center">
            <div className="my-2 flex sm:flex-row flex-col">
              <div className="flex flex-row mb-1 sm:mb-0">
                {/*  */}
                <SelectInput
                  label="Limit"
                  name="limit"
                  value={state.query.limit}
                  options={limitOptions}
                  onChange={handleQueryChange}
                  rounded="rounded-l"
                  key={"limit"}
                />
                {/*  */}
                <SelectInput
                  label="Sort"
                  name="sort"
                  value={state.query.sort}
                  options={sortOptions}
                  onChange={(e) => handleQueryChange(e)}
                  rounded=""
                  key={"sort"}
                />
              </div>
              {/*  */}
              <TextInput
                label="Search"
                name="query"
                value={state.query.query}
                onChange={handleQueryChange}
                type="Search"
                rounded="rounded-r"
                key={"query"}
              />
            </div>
            {/* prettier-ignore  */}
            <Button rounded="rounded" onClick={() => dispatch({ type: "ADD_GAME_MODAL" })}>
              New Game +
            </Button>
          </div>
          <TableHOC loading={state.loading}>
            {/* games table */}
            <Table
              render={state.messages ? false : true}
              headerRows={["ID", "Game Name", "Slots", "Actions"]}
              bodyRows={state.page?.content?.map((game) => {
                return [
                  // prettier-ignore
                  <TableBodyCell key={uuid4()} renderStatus={game?.renderStatus}>
                    <NormalText text={game?.gameId} />
                  </TableBodyCell>,
                  // prettier-ignore
                  <TableBodyCell key={uuid4()} renderStatus={game?.renderStatus}>
                    <NormalText text={game.gameName} />
                  </TableBodyCell>,
                  // prettier-ignore
                  <TableBodyCell key={uuid4()} renderStatus={game?.renderStatus}>
                    <Link
                      href={`${game?.renderStatus === "deleted" ? '#' : `games/${game.gameId}/slots`}`}
                      className="px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-800"
                      title="Open Slots"
                    >
                      Slots
                    </Link>
                  </TableBodyCell>,
                  // prettier-ignore
                  <TableBodyCell key={uuid4()} renderStatus={game?.renderStatus}>
                    <div className="inline-flex gap-4 w-full items-center justify-start">
                      {/* prettier-ignore */}
                      <Button classsName="w-7" title="Edit" disabled={game?.renderStatus === "deleted"}
                        onClick={() => dispatch({ type: "EDIT_GAME_MODAL", gamePaylod: game })}>
                        <EditIcon />
                      </Button>
                      {/* prettier-ignore */}
                      <Button classsName="w-7" title="Delete" disabled={game?.renderStatus === "deleted"}
                        onClick={() => dispatch({ type: "DELETE_GAME_MODAL", gamePaylod: game, })}>
                        <DeleteIcon />
                      </Button>
                    </div>
                  </TableBodyCell>,
                ];
              })}
            />
            <TableFooter
              messages={state.messages}
              nextPage={() => dispatch({ type: "NEXT_PAGE" })}
              prevPage={() => dispatch({ type: "PREV_PAGE" })}
              entriesCountProps={{
                pageNumber: state.page.number,
                pageSize: state.page.size,
                tableName: "Games",
                totalElements: state.page.totalElements,
              }}
              isFirstPage={state.page.first}
              isLastPage={state.page.last}
            />
          </TableHOC>
        </div>
      </div>

      {/* modal */}
      {/* prettier-ignore */}
      <ModalHOC key={"addGameModal"} show={state.modals.addGame.show}>
        <AddGame close={() => dispatch({ type: "CLOSE_MODALS" })} onSuccess={updateGame} />
      </ModalHOC>
      <ModalHOC key={"editGameModal"} show={state.modals.editGame.show}>
        {/* prettier-ignore */}
        <EditGame game={state.modals.editGame.game} close={() => dispatch({ type: "CLOSE_MODALS" })} onSuccess={updateGame} />
      </ModalHOC>

      <ModalHOC key={"deleteGameModal"} show={state.modals.deleteGame.show}>
        {/* prettier-ignore */}
        <DeleteGame game={state.modals.deleteGame.game} close={() => dispatch({ type: "CLOSE_MODALS" })} onSuccess={updateGame} />
      </ModalHOC>
    </>
  );
};

export default AdminGames;

const NormalText: React.FC<any> = (props) => {
  return (
    <p className="text-gray-900 whitespace-no-wrap">
      {props?.text ?? "No Data"}
    </p>
  );
};

async function fetchGames(
  query: GameQuery,
  authToken?: string
): Promise<GZResponse<GZPage<Game>>> {
  return gzRequest<GameQuery, null, GZPage<Game>>({
    requestMethod: "GET",
    requestQuery: query,
    requestPath: "/game/search",
    authToken: authToken,
  });
}

const limitOptions: { label: string; value: any }[] = [
  {
    label: "5",
    value: 5,
  },
  {
    label: "10",
    value: 10,
  },
  {
    label: "20",
    value: 20,
  },
];

const sortOptions: { label: string; value: any }[] = [
  {
    label: "ID - ASC",
    value: "gameId.asc",
  },
  {
    label: "ID - DESC",
    value: "gameId.desc",
  },
  {
    label: "Name - ASC",
    value: "gameName.asc",
  },
  {
    label: "Name - DESC",
    value: "gameName.desc",
  },
];

interface ComponentState {
  modals: {
    addGame: { show: boolean };
    editGame: { show: boolean; game?: Game };
    deleteGame: { show: boolean; game?: Game };
  };
  messages: string;
  page: GZPage<Game>;
  query: GameQuery;
  loading: boolean;
}

const initialState: ComponentState = {
  modals: {
    addGame: { show: false },
    editGame: { show: false },
    deleteGame: { show: false },
  },
  messages: "",
  page: {
    content: [],
    last: true,
    totalPages: 0,
    totalElements: 0,
    size: 1,
    number: 0,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false,
    },
    numberOfElements: 0,
    first: true,
    empty: true,
  },
  query: {
    query: "",
    limit: 5,
    include: "",
    pageNo: 0,
    sort: "gameId.asc",
  },
  loading: true,
};

interface StateAction {
  type: string;
  paylod?: any;
  pagePaylod?: GZPage<Game>;
  queryPaylod?: GameQuery;
  gamePaylod?: Game;
}

// prettier-ignore
function reducer(state: ComponentState, action: StateAction): ComponentState {
  switch (action.type) {
    case "ADD_GAME_MODAL":
      return { ...state, modals: { ...state.modals, addGame: { show: true } } };
    case "EDIT_GAME_MODAL":
      if (action?.gamePaylod)
        return { ...state, modals: { ...state.modals, editGame: { show: true, game: action.gamePaylod } } };
      return state;
    case "DELETE_GAME_MODAL":
      if (action?.gamePaylod)
        return { ...state, modals: { ...state.modals, deleteGame: { show: true, game: action.gamePaylod } } };
      return state;
    case "CLOSE_MODALS":
      return { ...state, modals: { ...state.modals, addGame: { show: false }, editGame: { show: false }, deleteGame: { show: false } } };
    case "SET_MESSAGES":
      return { ...state, messages: action?.paylod ?? "" };
    case "UPDATE_GAME":
      return { ...state, page: { ...state.page, content: state.page.content.map((g) => (g.gameId === action?.gamePaylod?.gameId) && action?.gamePaylod ? { ...g, ...action.gamePaylod } : g) } }
    case "APPEND_GAME":
      if (action?.gamePaylod)
        return { ...state, page: { ...state.page, content: [...state.page.content, action?.gamePaylod] } };
      return state;
    case "SET_PAGE":
      if (action?.pagePaylod)
        return { ...state, page: action?.pagePaylod };
      return state;
    case "SET_QUERY":
      if (action?.queryPaylod) {
        const prevPage = state.query.pageNo;
        const pageNo = prevPage === action.queryPaylod.pageNo ? 0 : action.queryPaylod.pageNo
        return { ...state, query: { ...state.query, ...action.queryPaylod, pageNo } }
      }
      return state;
    case "NEXT_PAGE":
      return { ...state, query: { ...state.query, pageNo: state.query.pageNo + 1 } };
    case "PREV_PAGE":
      return { ...state, query: { ...state.query, pageNo: state.query.pageNo - 1 } };
    case "LOADING":
      return { ...state, loading: action.paylod ?? false };
    default:
      return state;
  }
}
