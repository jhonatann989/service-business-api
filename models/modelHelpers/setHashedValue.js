import { hash } from "bcrypt"

export default function (value) {
    return hash(value)
}