import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  Card,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  makeStyles,
  TableBody,
  Button,
  IconButton,
  SvgIcon,
  CardHeader,
  Divider,
  Dialog,
} from "@material-ui/core";
import PerfectScrollbar from "react-perfect-scrollbar";
import AddIcon from "@material-ui/icons/Add";
import ModelFieldFormItem from "./ModelFieldFormItem";
import { useForm } from "react-hook-form";
import { ModelFieldDoc, ModelDoc } from "../../types";
import isEqual from "lodash/isEqual";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CheckIcon from "@material-ui/icons/Check";
import ModelNameForm, { ModelNameFormValues } from "./ModelNameForm";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(() => ({
  fieldNameCell: {
    width: 150,
  },
  typeCell: {
    width: 100,
  },
  arrayCell: {
    width: 50,
  },
  formatCell: {
    width: 120,
  },
  requiredCell: {
    width: 50,
  },
  addButton: {
    justifyContent: "start",
  },
  submit: {
    display: "none",
  },
}));

export interface ModelFieldFormValues {
  fieldName: string;
  fieldType: string;
  format: string;
  isRequired: boolean;
  isArray: boolean;
  description: string;
  enum: string;
  target?: ModelFieldDoc;
}

export interface ModelFormProps {
  onSubmitModelField: (data: ModelFieldFormValues) => void;
  model?: ModelDoc;
  modelFields?: ModelFieldDoc[];
  onDeleteModelField: (modelField: ModelFieldDoc) => void;
  onSubmitModel: (data: ModelNameFormValues) => void;
  /**
   * onClose가 전달되면 X 버튼이 생성
   */
  onClose?: () => void;
  existingModelNames: string[];
}

const ModelForm: React.FC<ModelFormProps> = ({
  onSubmitModelField,
  model,
  onDeleteModelField,
  onSubmitModel,
  onClose,
  modelFields = [],
  existingModelNames,
}) => {
  const classes = useStyles();

  const [isNewFormVisible, setIsNewFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [currentModelField, setCurrentModelField] = useState<
    ModelFieldDoc | undefined
  >(undefined);
  const [fieldNameToFocus, setFieldNameToFocus] = useState<
    keyof ModelFieldFormValues | undefined
  >(undefined);

  const isFocusingRef = useRef<boolean>(false);
  const modelNameInputRef = useRef<any>(undefined);
  const isCancelingRef = useRef<boolean>(false);

  const showNewForm = useCallback(() => {
    setIsEditFormVisible(false);
    setFieldNameToFocus(undefined);
    setCurrentModelField(undefined);
    setIsNewFormVisible(true);
  }, []);

  const defaultValues: ModelFieldFormValues = useMemo(() => {
    return {
      fieldName: currentModelField?.fieldName.value || "",
      isRequired: currentModelField ? currentModelField.isRequired.value : true,
      fieldType: currentModelField?.fieldType.value || "string",
      format: currentModelField?.format.value || "없음",
      enum: currentModelField?.enum.value || "없음",
      description: currentModelField?.description.value || "",
      isArray: currentModelField ? currentModelField.isArray.value : false,
    };
  }, [currentModelField]);

  const formProps = useForm<ModelFieldFormValues>({
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, errors, watch, getValues, setValue } = formProps;

  const watchedValues = watch();

  const handleOnSubmit = useCallback(
    async (values) => {
      setCurrentModelField(undefined);
      let isSubmitted = false;
      await handleSubmit((_data) => {
        isSubmitted = true;
        onSubmitModelField({ ...values, target: currentModelField });
      })();
      if (!isSubmitted) {
        return;
      }
      setIsNewFormVisible(false);
      setIsEditFormVisible(false);
    },
    [currentModelField, handleSubmit, onSubmitModelField]
  );

  const isFieldModified = useMemo(() => {
    return !isEqual(watchedValues, defaultValues);
  }, [defaultValues, watchedValues]);

  const hideForms = useCallback(() => {
    setIsEditFormVisible(false);
    setIsNewFormVisible(false);
    setCurrentModelField(undefined);
  }, []);

  const onBlurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const handleOnBlur = useCallback(() => {
    isFocusingRef.current = false;

    onBlurTimeout.current = setTimeout(() => {
      const hasError = !!Object.keys(errors).length;
      if (!currentModelField) {
        const isCanceled = isEqual(getValues(), defaultValues);
        if (isCanceled && !isFocusingRef.current) {
          setIsNewFormVisible(false);
          return;
        }
      }
      if (!hasError && !isFocusingRef.current && isFieldModified) {
        handleOnSubmit(getValues());
      } else if (!isFocusingRef.current && !hasError) {
        hideForms();
      }
    }, 100);
  }, [
    currentModelField,
    defaultValues,
    errors,
    getValues,
    handleOnSubmit,
    hideForms,
    isFieldModified,
  ]);

  const handleOnFocus = useCallback(() => {
    if (!modelNameInputRef.current.value) {
      modelNameInputRef.current.focus();
      hideForms();
      return;
    }
    isFocusingRef.current = true;
  }, [hideForms]);

  const showEditForm = useCallback(
    (modelField: ModelFieldDoc, fieldName: keyof ModelFieldFormValues) => {
      if (isNewFormVisible) {
        setIsNewFormVisible(false);
      } else {
        setCurrentModelField(modelField);
        setIsEditFormVisible(true);
        setFieldNameToFocus(fieldName);
      }
    },
    [isNewFormVisible]
  );

  useEffect(() => {
    if (currentModelField) {
      setValue("fieldName", defaultValues.fieldName, { shouldValidate: true });
      setValue("isRequired", defaultValues.isRequired, {
        shouldValidate: true,
      });
      setValue("isArray", defaultValues.isArray, {
        shouldValidate: true,
      });
      setValue("fieldType", defaultValues.fieldType, { shouldValidate: true });
      setValue("format", defaultValues.format, { shouldValidate: true });
      setValue("enum", defaultValues.enum, { shouldValidate: true });
      setValue("description", defaultValues.description, {
        shouldValidate: true,
      });
    }
  }, [currentModelField, defaultValues, setValue]);

  useEffect(() => {
    return () => {
      clearTimeout(onBlurTimeout.current);
    };
  }, []);

  const cancelTask = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // ModelNameForm 에서의 참조를 위해
        isCancelingRef.current = true;
        if (
          (!isEditFormVisible && !isNewFormVisible) ||
          !modelNameInputRef.current?.value
        ) {
          onClose?.();
        } else {
          setIsEditFormVisible(false);
          setIsNewFormVisible(false);
        }
      }
    },
    [isEditFormVisible, isNewFormVisible, onClose]
  );

  useEffect(() => {
    window.addEventListener("keyup", cancelTask);
    return () => {
      window.removeEventListener("keyup", cancelTask);
    };
  }, [cancelTask]);

  return (
    <Card>
      <CardHeader
        title="모델 편집"
        action={
          onClose ? (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          ) : undefined
        }
      />
      <Divider />
      <ModelNameForm
        isCancelingRef={isCancelingRef}
        nameInputRef={modelNameInputRef}
        onSubmit={onSubmitModel}
        model={model}
        existingModelNames={existingModelNames}
      />
      <Divider />
      <PerfectScrollbar>
        <Box minWidth={700}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOnSubmit(getValues());
            }}
            noValidate
          >
            <Table>
              <caption></caption>
              <TableHead>
                <TableRow>
                  <TableCell component="th" className={classes.fieldNameCell}>
                    필드명*
                  </TableCell>
                  <TableCell align="center" className={classes.requiredCell}>
                    필수
                  </TableCell>
                  <TableCell align="center" className={classes.arrayCell}>
                    배열
                  </TableCell>
                  <TableCell className={classes.typeCell}>타입*</TableCell>
                  <TableCell className={classes.formatCell}>포맷</TableCell>
                  <TableCell className={classes.formatCell}>열거형</TableCell>
                  <TableCell>설명</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelFields.map((modelField) => (
                  <TableRow key={modelField.id}>
                    {isEditFormVisible &&
                    currentModelField?.id === modelField.id ? (
                      <ModelFieldFormItem
                        formProps={formProps}
                        autoFocusField={fieldNameToFocus}
                        onBlur={handleOnBlur}
                        onFocus={handleOnFocus}
                        defaultValues={defaultValues}
                        modelFields={modelFields}
                      />
                    ) : (
                      <>
                        <TableCell
                          onClick={() => showEditForm(modelField, "fieldName")}
                        >
                          {modelField.fieldName.value}
                        </TableCell>
                        <TableCell
                          align="center"
                          onClick={() => showEditForm(modelField, "isRequired")}
                        >
                          {modelField.isRequired.value ? (
                            <CheckIcon fontSize="small" />
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          onClick={() => showEditForm(modelField, "isArray")}
                        >
                          {modelField.isArray.value ? (
                            <CheckIcon fontSize="small" />
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell
                          onClick={() => showEditForm(modelField, "fieldType")}
                        >
                          {modelField.fieldType.value}
                        </TableCell>

                        <TableCell
                          onClick={() => showEditForm(modelField, "format")}
                        >
                          {modelField.format.value}
                        </TableCell>
                        <TableCell
                          onClick={() => showEditForm(modelField, "enum")}
                        >
                          {modelField.enum.value}
                        </TableCell>
                        <TableCell
                          onClick={() =>
                            showEditForm(modelField, "description")
                          }
                        >
                          {modelField.description.value}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => onDeleteModelField(modelField)}
                          >
                            <SvgIcon fontSize="small">
                              <DeleteOutlineIcon />
                            </SvgIcon>
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                <TableRow>
                  {isNewFormVisible ? (
                    <ModelFieldFormItem
                      formProps={formProps}
                      onBlur={handleOnBlur}
                      onFocus={handleOnFocus}
                      autoFocusField={fieldNameToFocus}
                      defaultValues={defaultValues}
                      modelFields={modelFields}
                    />
                  ) : (
                    <TableCell colSpan={8}>
                      <Button
                        className={classes.addButton}
                        fullWidth
                        color="secondary"
                        onClick={showNewForm}
                      >
                        <AddIcon fontSize="small" /> 새로운 필드 추가
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
            <button className={classes.submit} type="submit" />
          </form>
        </Box>
      </PerfectScrollbar>
    </Card>
  );
};

export interface ModelFormModalProps extends ModelFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ModelFormModal: React.FC<ModelFormModalProps> = ({
  isVisible,
  onClose,
  ...restProps
}) => {
  return (
    <Dialog open={isVisible} fullWidth maxWidth="xl">
      <ModelForm {...restProps} onClose={onClose} />
    </Dialog>
  );
};

export default ModelForm;
