package br.com.jair.presenca_escolar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.jair.presenca_escolar.model.Tecnologia;

@Repository
public interface TecnologiaRepository extends JpaRepository<Tecnologia, Long> {

    boolean existsByName(String name);

}
