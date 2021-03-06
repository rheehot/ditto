import { FirebaseReducer } from "react-redux-firebase";

export enum THEMES {
  LIGHT = "LIGHT",
  DARK = "DARK",
}

export enum REQUEST_METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface Recordable {
  createdAt: firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.FieldValue;
  createdBy: string;
  updatedBy: string;
}

export interface DataRecord extends Recordable {
  dataRecordId: string;
  next: string;
  key: string;
  type: DATA_TYPE;
  customEnumId?: string;
  dataObjectId?: string;
  isRequired: boolean;
}

export interface DataObject extends Recordable {
  dataObjectId: string;
  title?: string; // 없을경우 anonymous
  dataRecord: DataRecord[];
}

export enum DATA_TYPE {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  ENUM = "ENUM",
  OBJECT = "OBJECT",
}

export enum QUERY_PARAM_TYPE {
  STRING = "STRING",
  NUMBER = "NUMBER",
  ENUM = "ENUM",
}

export interface QueryParam extends Recordable {
  key: string;
  type: QUERY_PARAM_TYPE;
  customEnumId?: string;
  description?: string;
}

export interface CustomEnumItem extends Recordable {
  customEnumItemId: string;
  title?: string; // 없을경우 anonymous
  key: string;
  value: string;
  description?: string;
}

export interface CustomEnum extends Recordable {
  customEnumId: string;
  customEnumItems: CustomEnumItem[];
}

export interface RequestHeader extends Recordable {
  requestHeaderId: string;
  key: string;
  description?: string;
}

export interface RequestBody extends Recordable {
  requestBodyId: string;
  key: string;
  type: DATA_TYPE;
}

export interface RequestItem extends Recordable {
  requestItemId: string;
  projectItemId: string;
  groupItemId?: string;
  seq: number;
  title: string;
  method: REQUEST_METHOD;
  url?: string;
  queryParams?: QueryParam[];
  headers?: RequestHeader[];
  body?: RequestBody[];
}

export interface User {
  auth: FirebaseReducer.AuthState;
}

/**
 * 생성할 때의 프로젝트
 */
export interface ProjectItem extends Recordable {
  title: string;
  description: string;
  members: Record<string, boolean>; // owner, manager, guest포함 전체
  owners: Record<string, boolean>;
  managers: Record<string, boolean>;
  guests: Record<string, boolean>;
  settingsByMember: Record<string, ProjectSettings>;
  invitees?: Record<string, boolean>;
}

export interface BaseSettings {
  updatedAt: firebase.firestore.FieldValue;
}

export interface ProjectSettings extends BaseSettings {
  seq: number;
}

export interface DocTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type Doc<T extends Recordable, S extends BaseSettings> = Omit<
  T,
  "updatedAt" | "createdAt" | "settingsByMember"
> & {
  id: string;
  updatedAt: DocTimestamp;
  createdAt: DocTimestamp;
  settingsByMember: Record<
    string,
    Omit<S, "updatedAt"> & {
      updatedAt: DocTimestamp;
    }
  >;
};

/**
 * 읽을 때의 프로젝트
 */
export type ProjectDoc = Doc<ProjectItem, ProjectSettings>;

export interface ProjectUrlSettings extends BaseSettings {}

export interface ProjectUrlItem extends Recordable {
  projectId: string;
  label: string;
  url: string;
  description?: string;
  settingsByMember: Record<string, ProjectUrlSettings>;
  usedByRequest?: Record<string, boolean>;
}

export type ProjectUrlDoc = Doc<ProjectUrlItem, ProjectUrlSettings>;

export enum FIELD_TYPE {
  INTEGER = "integer",
  NUMBER = "number",
  STRING = "string",
  BOOLEAN = "boolean",
  OBJECT = "object",
}

export const fieldTypes = Object.keys(FIELD_TYPE).map(
  // @ts-ignore
  (key) => FIELD_TYPE[key as keyof FIELD_TYPE]
);

export enum FORMAT {
  NONE = "없음",
  NEW_MODEL = "새로운 모델",
  INT32 = "int32",
  INT64 = "int64",
  FLOAT = "float",
  DOUBLE = "double",
  BYTE = "byte",
  BINARY = "binary",
  DATE = "date",
  DATE_TIME = "date-time",
  PASSWORD = "password",
}

export const formats: { [k in FIELD_TYPE]: (string | undefined)[] } = {
  [FIELD_TYPE.INTEGER]: [FORMAT.INT32, FORMAT.INT64],
  [FIELD_TYPE.NUMBER]: [FORMAT.NONE, FORMAT.FLOAT, FORMAT.DOUBLE],
  [FIELD_TYPE.STRING]: [
    FORMAT.NONE,
    FORMAT.DATE,
    FORMAT.DATE_TIME,
    FORMAT.PASSWORD,
    FORMAT.BYTE,
    FORMAT.BINARY,
  ],
  [FIELD_TYPE.BOOLEAN]: [FORMAT.NONE],
  [FIELD_TYPE.OBJECT]: [FORMAT.NEW_MODEL],
};

export interface ModelCell<T> extends Recordable {
  value: T;
  settingsByMember: Record<string, BaseSettings>;
}

export interface ModelFieldItem extends Recordable {
  projectId: string;
  modelId: string;
  referenceModelId?: string; // object인 경우 참조하는 모델
  fieldName: ModelCell<string>;
  isRequired: ModelCell<boolean>;
  isArray: ModelCell<boolean>;
  fieldType: ModelCell<string>;
  format: ModelCell<string>;
  enum: ModelCell<string>;
  description: ModelCell<string>;
  settingsByMember: Record<string, BaseSettings>;
}

export interface ModifiableModelFieldItem
  extends Omit<
    Partial<ModelFieldItem>,
    | "fieldName"
    | "isRequired"
    | "isArray"
    | "fieldType"
    | "format"
    | "enum"
    | "description"
  > {
  fieldName: Partial<ModelCell<string>>;
  isRequired: Partial<ModelCell<boolean>>;
  isArray: Partial<ModelCell<boolean>>;
  fieldType: Partial<ModelCell<string>>;
  format: Partial<ModelCell<string>>;
  enum: Partial<ModelCell<string>>;
  description: Partial<ModelCell<string>>;
}

export interface ModelItem extends Recordable {
  projectId: string;
  name: string;
  extends?: string;
  description?: string;
  referencedByModelField?: Record<string, boolean>;
  extendedByByModel?: Record<string, boolean>;
  settingsByMember: Record<string, BaseSettings>;
}

export type ModelCellDoc<T> = Doc<ModelCell<T>, BaseSettings>;

export type ModelFieldDoc = Omit<
  Doc<ModelFieldItem, BaseSettings>,
  | "fieldName"
  | "isRequired"
  | "fieldType"
  | "format"
  | "enum"
  | "description"
  | "isArray"
> & {
  fieldName: ModelCellDoc<string>;
  isRequired: ModelCellDoc<boolean>;
  isArray: ModelCellDoc<boolean>;
  fieldType: ModelCellDoc<string>;
  format: ModelCellDoc<string>;
  enum: ModelCellDoc<string>;
  description: ModelCellDoc<string>;
};

export type ModelDoc = Doc<ModelItem, BaseSettings>;
