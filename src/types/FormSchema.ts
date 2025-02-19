import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(8).optional(),
  password: z.string().min(8),
});

export default FormSchema;
