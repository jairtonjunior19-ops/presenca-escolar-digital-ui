package br.com.jair.presenca_escolar.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.jair.presenca_escolar.dto.TecnologiaRequestDTO;
import br.com.jair.presenca_escolar.dto.TecnologiaResponseDTO;
import br.com.jair.presenca_escolar.service.TecnologiaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tecnologia")
public class TecnologiaController {

    @Autowired
    private TecnologiaService service;

    @GetMapping
    public ResponseEntity<List<TecnologiaResponseDTO>> buscarTodos() {
        return ResponseEntity.ok(service.buscarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TecnologiaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TecnologiaResponseDTO> salvar(@RequestBody @Valid TecnologiaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TecnologiaResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid TecnologiaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}