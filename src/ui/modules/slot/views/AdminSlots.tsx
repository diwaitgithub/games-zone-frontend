"use client";

import ModalHOC from "@/ui/components/modal/ModalHOC";
import Button from "@/ui/components/common/Button";
import DeleteIcon from "@/ui/components/common/icons/DeleteIcon";
import EditIcon from "@/ui/components/common/icons/EditIcon";
import SelectInput from "@/ui/components/form/SelectInput";
import TextInput from "@/ui/components/form/TextInput";
import Table from "@/ui/components/table/Table";
import TableBodyCell from "@/ui/components/table/TableBodyCell";
import TableFooter from "@/ui/components/table/TableFooter";
import TableHOC from "@/ui/components/table/TableHOC";
import { useSession } from "next-auth/react";
import React, { useReducer, useEffect } from "react";
import AddSlot from "../features/AddSlot";
import EditSlot from "../features/EditSlot";
import DeleteSlot from "../features/DeleteSlot";
import convertTo12HourFormat from "@/lib/utils/convertTo12HrFormat";
import fetchSlots from "../requests/fetchSlots";
import { v4 as uuid4 } from "uuid";

interface Props {
  gameId: number;
}

const AdminSlots: React.FC<Props> = (props) => {
  const { gameId } = props;
  const { data: session, status: authStatus } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);

  // prettier-ignore
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    event.preventDefault();
    dispatch({ type: "SET_QUERY", queryPaylod: { ...state.query, [event.target.name]: event.target.value } })
  };

  // prettier-ignore
  const updateSlot = (slot: Slot, actionType: "UPDATE_SLOT" | "APPEND_SLOT") => {
    dispatch({ type: actionType, slotPaylod: slot });
  }

  useEffect(() => {
    if (authStatus === "loading") return () => {};

    const timeOutId = setTimeout(() => {
      dispatch({ type: "LOADING", paylod: true });
    }, 150);

    dispatch({ type: "SET_MESSAGES", paylod: "" });

    fetchSlots(gameId, state.query, session?.auth?.token)
      .then((res: GZResponse<GZPage<Slot>>) => {
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
            <h2 className="text-2xl font-semibold leading-tight">
              Slots : {gameId}
            </h2>
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
                label="Name"
                name="name"
                value={state.query.name}
                onChange={handleQueryChange}
                type="Search"
                placeholder="Slot Name"
                rounded=""
                key={"name"}
              />
              <TextInput
                label="Location"
                name="location"
                value={state.query.location}
                onChange={handleQueryChange}
                type="Search"
                placeholder="Slot Location"
                rounded="rounded-r"
                key={"location"}
              />
            </div>
            {/* prettier-ignore  */}
            <Button rounded="rounded" onClick={() => dispatch({ type: "ADD_SLOT_MODAL" })}>
              New Slot +
            </Button>
          </div>
          <TableHOC loading={state.loading}>
            {/* games table */}
            <Table
              render={state.messages ? false : true}
              // prettier-ignore
              headerRows={["ID", "Slot Name", "Start Time", "End Time", "Location", "Actions"]}
              // prettier-ignore
              bodyRows={state.page?.content?.map((slot, index) => {
                return [
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <NormalText text={slot?.slotId} />
                  </TableBodyCell>,
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <NormalText text={slot?.slotName} />
                  </TableBodyCell>,
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <NormalText text={convertTo12HourFormat(slot?.startTime)} />
                  </TableBodyCell>,
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <NormalText text={convertTo12HourFormat(slot?.endTime)} />
                  </TableBodyCell>,
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <NormalText text={slot?.location} />
                  </TableBodyCell>,
                  //
                  <TableBodyCell key={uuid4()} renderStatus={slot?.renderStatus}>
                    <div className="inline-flex gap-4 w-full items-center justify-start">
                      {/* prettier-ignore */}
                      <Button classsName="w-7" title="Edit" disabled={slot?.renderStatus === "deleted"}
                        onClick={() => dispatch({ type: "EDIT_SLOT_MODAL", slotPaylod: slot })}>
                        <EditIcon />
                      </Button>
                      {/* prettier-ignore */}
                      <Button classsName="w-7" title="Delete" disabled={slot?.renderStatus === "deleted"}
                        onClick={() => dispatch({ type: "DELETE_SLOT_MODAL", slotPaylod: slot, })}>
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
                tableName: "Slots",
                totalElements: state.page.totalElements,
              }}
              isFirstPage={state.page.first}
              isLastPage={state.page.last}
            />
          </TableHOC>
        </div>
      </div>

      {/* modal */}
      <ModalHOC key={"addGameModal"} show={state.modals.addSlot.show}>
        {/* prettier-ignore */}
        <AddSlot close={() => dispatch({ type: "CLOSE_MODALS" })} gameId={gameId} onSuccess={updateSlot} />
      </ModalHOC>
      <ModalHOC key={"editGameModal"} show={state.modals.editSlot.show}>
        {/* prettier-ignore */}
        <EditSlot slot={state.modals.editSlot.slot ?? {} as Slot} gameId={gameId} close={() => dispatch({ type: "CLOSE_MODALS" })} onSuccess={updateSlot} />
      </ModalHOC>

      <ModalHOC key={"deleteGameModal"} show={state.modals.deleteSlot.show}>
        {/* prettier-ignore */}
        <DeleteSlot slot={state.modals.deleteSlot.slot ?? {} as Slot} gameId={gameId} close={() => dispatch({ type: "CLOSE_MODALS" })} onSuccess={updateSlot} />
      </ModalHOC>
    </>
  );
};

export default AdminSlots;

const NormalText: React.FC<any> = (props) => {
  return (
    <p className="text-gray-900 whitespace-no-wrap">
      {props?.text ?? "No Data"}
    </p>
  );
};

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
    value: "slotId.asc",
  },
  {
    label: "ID - DESC",
    value: "slotId.desc",
  },
  {
    label: "Name - ASC",
    value: "slotName.asc",
  },
  {
    label: "Name - DESC",
    value: "slotName.desc",
  },
  {
    label: "StartTime - ASC",
    value: "startTime.asc",
  },
  {
    label: "StartTime - DESC",
    value: "startTime.desc",
  },
  {
    label: "EndTime - ASC",
    value: "endTime.asc",
  },
  {
    label: "EndTime - DESC",
    value: "endTime.desc",
  },
  {
    label: "Location - ASC",
    value: "location.asc",
  },
  {
    label: "Location - DESC",
    value: "location.desc",
  },
];

const initialState: ComponentState = {
  modals: {
    addSlot: { show: false },
    editSlot: { show: false },
    deleteSlot: { show: false },
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
    name: "",
    location: "",
    limit: 5,
    pageNo: 0,
    sort: "location.desc",
  },
  loading: true,
};

interface ComponentState {
  modals: {
    addSlot: { show: boolean };
    editSlot: { show: boolean; slot?: Slot };
    deleteSlot: { show: boolean; slot?: Slot };
  };
  messages: string;
  page: GZPage<Slot>;
  query: SlotQuery;
  loading: boolean;
}

interface StateAction {
  type: string;
  paylod?: any;
  pagePaylod?: GZPage<Slot>;
  queryPaylod?: SlotQuery;
  slotPaylod?: Slot;
}

// prettier-ignore
function reducer(state: ComponentState, action: StateAction): ComponentState {
  switch (action.type) {
    case "ADD_SLOT_MODAL":
      return { ...state, modals: { ...state.modals, addSlot: { show: true } } };
    case "EDIT_SLOT_MODAL":
      if (action?.slotPaylod)
        return { ...state, modals: { ...state.modals, editSlot: { show: true, slot: action.slotPaylod } } };
      return state;
    case "DELETE_SLOT_MODAL":
      if (action?.slotPaylod)
        return { ...state, modals: { ...state.modals, deleteSlot: { show: true, slot: action.slotPaylod } } };
      return state;
    case "CLOSE_MODALS":
      return { ...state, modals: { ...state.modals, addSlot: { show: false }, editSlot: { show: false }, deleteSlot: { show: false } } };
    case "SET_MESSAGES":
      return { ...state, messages: action?.paylod ?? "" };
    case "UPDATE_SLOT":
      return { ...state, page: { ...state.page, content: state.page.content.map((s) => (s.slotId === action?.slotPaylod?.slotId) && action?.slotPaylod ? { ...s, ...action.slotPaylod } : s) } }
    case "APPEND_SLOT":
      if (action?.slotPaylod)
        return { ...state, page: { ...state.page, content: [...state.page.content, action?.slotPaylod] } };
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
