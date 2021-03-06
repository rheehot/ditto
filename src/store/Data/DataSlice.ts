import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ProjectDoc,
  ProjectUrlDoc,
  ModelDoc,
  ModelFieldDoc,
} from "../../types";

export enum DATA_KEY {
  PROJECTS = "projects",
  PROJECT = "project",
  PROJECT_URLS = "projectUrls",
  MODELS = "models",
  FIELDS = "fields",
  MODEL_FORMS = "modelForms",
  MODEL_FIELDS = "modelFields",
}

export interface DataPayload {
  key: DATA_KEY;
  data: any;
}

export interface RecordDataPayload {
  key: DATA_KEY;
  recordKey: string;
  subRecordKey?: string;
  data: any;
}

export interface DataState {
  [DATA_KEY.PROJECTS]?: ProjectDoc[];
  /**
   * 현재 선택된 프로젝트
   */
  [DATA_KEY.PROJECT]?: ProjectDoc;
  /**
   * project id를 키로 사용하는 Record 형식
   */
  [DATA_KEY.PROJECT_URLS]?: Record<string, ProjectUrlDoc[]>;
  /**
   * { projectId: { modelId: data } } 형식
   */
  [DATA_KEY.MODELS]?: Record<string, Record<string, ModelDoc>>;
  /**
   * { modelId: { modelFieldId: data } } 형식
   */
  [DATA_KEY.FIELDS]?: Record<string, Record<string, ModelFieldDoc>>;
  /**
   * { modelFormId: modelId } 형식
   */
  [DATA_KEY.MODEL_FORMS]?: Record<string, string>;
  /**
   * 현재 수정하고 있는 모델 필드들
   */
  [DATA_KEY.MODEL_FIELDS]?: ModelFieldDoc[];
}

export const initialDataState: DataState = {};

const DataSlice = createSlice({
  name: "Data",
  initialState: initialDataState,
  reducers: {
    receiveData: (state, action: PayloadAction<DataPayload>) => {
      state[action.payload.key] = action.payload.data;
    },
    receiveRecordData: (state, action: PayloadAction<RecordDataPayload>) => {
      const { key, recordKey, subRecordKey, data } = action.payload;
      if (!state[key]) {
        // @ts-ignore
        state[key] = {};
      }
      if (!subRecordKey) {
        (state[key] as Record<string, any>)[recordKey] = data;
      } else {
        if (!(state[key] as Record<string, any>)[recordKey]) {
          (state[key] as Record<string, any>)[recordKey] = {};
        }
        (state[key] as Record<string, any>)[recordKey][subRecordKey] = data;
      }
    },
    receiveMultipleData: (state, action: PayloadAction<DataPayload[]>) => {
      const { payload } = action;
      payload.forEach((item: DataPayload) => {
        state[item.key] = item.data;
      });
    },
    clearRecordData: (
      state,
      action: PayloadAction<Omit<RecordDataPayload, "data">>
    ) => {
      const { key, recordKey, subRecordKey } = action.payload;
      if (subRecordKey) {
        // @ts-ignore
        if (state[key]?.[recordKey]) {
          // @ts-ignore
          delete state[key][recordKey];
        }
      } else {
        // @ts-ignore
        if (state[key]?.[recordKey]?.[subRecordKey]) {
          // @ts-ignore
          delete state[key][recordKey][subRecordKey];
        }
      }
    },
    clearData: (state, action: PayloadAction<DATA_KEY>) => {
      delete state[action.payload];
    },
  },
});

export const DataActions = DataSlice.actions;

export default DataSlice;
