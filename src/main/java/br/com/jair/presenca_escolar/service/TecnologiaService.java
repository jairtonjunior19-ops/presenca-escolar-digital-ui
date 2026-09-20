package br.com.jair.presenca_escolar.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.jair.presenca_escolar.dto.TecnologiaRequestDTO;
import br.com.jair.presenca_escolar.dto.TecnologiaResponseDTO;
import br.com.jair.presenca_escolar.exception.BusinessException;
import br.com.jair.presenca_escolar.exception.ResourceNotFoundException;
import br.com.jair.presenca_escolar.model.Tecnologia;
import br.com.jair.presenca_escolar.repository.TecnologiaRepository;

@Service
public class TecnologiaService {

    @Autowired
    private TecnologiaRepository repository;

    public List<TecnologiaResponseDTO> buscarTodos() {
        return repository.findAll()
                .stream()
                .map(TecnologiaResponseDTO::fromEntity)
                .toList();
    }

    public TecnologiaResponseDTO buscarPorId(Long id) {
        Tecnologia tecnologia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tecnologia não encontrada com o ID: " + id));
        return TecnologiaResponseDTO.fromEntity(tecnologia);
    }

    public TecnologiaResponseDTO salvar(TecnologiaRequestDTO dto) {
        if (repository.existsByName(dto.name())) {
            throw new BusinessException("Já existe uma tecnologia com esse nome.");
        }
        Tecnologia tecnologia = new Tecnologia();
        tecnologia.setName(dto.name());
        tecnologia = repository.save(tecnologia);
        return TecnologiaResponseDTO.fromEntity(tecnologia);
    }

    public TecnologiaResponseDTO atualizar(Long id, TecnologiaRequestDTO dto) {
        Tecnologia tecnologia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tecnologia não encontrada com o ID: " + id));

        if (!tecnologia.getName().equalsIgnoreCase(dto.name()) && repository.existsByName(dto.name())) {
            throw new BusinessException("Já existe uma tecnologia com esse nome.");
        }

        tecnologia.setName(dto.name());
        tecnologia = repository.save(tecnologia);
        return TecnologiaResponseDTO.fromEntity(tecnologia);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Tecnologia não encontrada com o ID: " + id);
        }
        repository.deleteById(id);
    }
}