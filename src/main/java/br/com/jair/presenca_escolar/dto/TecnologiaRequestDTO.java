package br.com.jair.presenca_escolar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TecnologiaRequestDTO(
    @NotBlank(message = "O nome da tecnologia é obrigatório")
    @Size(min = 2, max = 50, message = "O nome deve ter entre 2 e 50 caracteres")
    String name
) {
}
