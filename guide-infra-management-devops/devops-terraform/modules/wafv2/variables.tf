variable "project" {
  type = string
}

variable "alb" {
  type = any
}

variable "guide_ipset" {
  type = list(string)
}
