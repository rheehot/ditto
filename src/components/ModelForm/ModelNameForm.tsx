import React from "react";
import { CardContent, Grid, TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";

export interface ModelNameFormValues {
  name: string;
  description: string;
}

export interface ModelNameFormProps {
  defaultValues?: ModelNameFormValues;
  nameInputRef: React.MutableRefObject<any>;
  onSubmit: (data: ModelNameFormValues) => void;
}

const ModelNameForm: React.FC<ModelNameFormProps> = ({
  defaultValues,
  nameInputRef,
}) => {
  const { register, errors } = useForm({
    mode: "onChange",
    defaultValues,
  });

  return (
    <CardContent>
      <Grid container spacing={3}>
        <Grid item sm={5}>
          <TextField
            label="모델명"
            autoFocus
            name="name"
            inputRef={(e) => {
              nameInputRef.current = e;
              register(e, {
                required: "모델명을 입력해주세요.",
                maxLength: {
                  value: 40,
                  message: "별로 좋은 생각이 아닌 것 같아요.",
                },
              });
            }}
            variant="outlined"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name?.message}
            size="small"
          />
        </Grid>
        <Grid item sm={7}>
          <TextField
            label="설명"
            name="description"
            inputRef={register({
              maxLength: {
                value: 100,
                message: "설명이 너무 길어요.",
              },
            })}
            variant="outlined"
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
            size="small"
          />
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default ModelNameForm;
