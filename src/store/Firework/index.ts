import { db } from "../../firebase";
import mockFirework from "./mockFirework";
import { ProjectItem, ProjectUrlItem, ProjectUrlDoc } from "../../types";
import { call } from "typed-redux-saga";

function* addDocument<T>(path: string, data: T) {
  yield db.collection(path).add(data);
}

function* addProject(data: ProjectItem) {
  yield call(addDocument, "projects", data);
}

function getMyProjectsRef(uid: string) {
  return db.collection("projects").where(`members.${uid}`, "==", true);
}

function* updateDocument<T>(path: string, id: string, data: Partial<T>) {
  yield db.collection(path).doc(id).update(data);
}

function* updateProject(id: string, data: Partial<ProjectItem>) {
  yield call(updateDocument, "projects", id, data);
}

function* deleteDocument(path: string, id: string) {
  yield db.collection(path).doc(id).delete();
}

function* deleteProject(id: string) {
  yield call(deleteDocument, "projects", id);
}

function* addProjectUrl(data: ProjectUrlItem) {
  yield call(addDocument, `projects/${data.projectId}/urls`, data);
}

function getProjectUrlRef(projectId: string) {
  return db
    .collection(`projects/${projectId}/urls`)
    .orderBy("createdAt", "asc");
}

function* deleteProjectUrl(projectUrl: ProjectUrlDoc) {
  yield call(
    deleteDocument,
    `projects/${projectUrl.projectId}/urls/`,
    projectUrl.id
  );
}

function* updateProjectUrl(projectUrl: Partial<ProjectUrlDoc>) {
  yield call(
    updateDocument,
    `projects/${projectUrl.projectId!}/urls`,
    projectUrl.id!,
    projectUrl
  );
}

export const realFirework = {
  addDocument,
  addProject,
  getMyProjectsRef,
  updateProject,
  deleteDocument,
  deleteProject,
  addProjectUrl,
  getProjectUrlRef,
  deleteProjectUrl,
  updateProjectUrl,
};

const isMockMode = process.env.REACT_APP_MOCK === "true";

export default isMockMode ? mockFirework : realFirework;
