package br.com.jair.presenca_escolar.dto;

import br.com.jair.presenca_escolar.model.Tecnologia;

public record TecnologiaResponseDTO(Long id, String name) {
	
	public static TecnologiaResponseDTO fromEntity(Tecnologia tech) {
		return new TecnologiaResponseDTO(tech.getId(), tech.getName());
	}

}
